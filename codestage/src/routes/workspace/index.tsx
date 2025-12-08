import { type Client, type IFrame, Stomp } from "@stomp/stompjs";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { AuthLoadingPage, InvalidTokenPage } from "@/components/invalid-token";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { config } from "@/lib/api-client";
import { AssessmentControllerApi } from "@/lib/generated-api";
import type { JwtCandidate } from "@/lib/generated-api/models/JwtCandidate";

interface WorkspaceSearch {
	token?: string;
}

export const Route = createFileRoute("/workspace/")({
	validateSearch: (search: Record<string, unknown>): WorkspaceSearch => {
		return {
			token: typeof search.token === "string" ? search.token : undefined,
		};
	},
	component: WorkspacePage,
});

export default function WorkspacePage() {
	const { token } = Route.useSearch();

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [candidate, setCandidate] = useState<JwtCandidate | null>(null);
	const stompClientRef = useRef<Client | null>(null);

	useEffect(() => {
		if (!token) {
			setError("No token provided");
			setIsLoading(false);
			return;
		}

		const verifyAndConnect = async () => {
			try {
				const validToken = await new AssessmentControllerApi(
					config,
				).checkCandidateToken({
					headers: {
						Authorization: token,
					},
				});
				if (!validToken) {
					setError("Invalid token");
					setIsLoading(false);
					return;
				}
				setCandidate(validToken);
				console.log("Candidate:", validToken);
				const stompClient = Stomp.over(
					() => new SockJS(`${import.meta.env.VITE_PUBLIC_SERVER_URL}/ws`),
				);
				stompClient.debug = (..._any) => {}
				stompClient.connect(
					{ Authorization: token },
					(frame: IFrame) => {
						console.log("Connected:", frame);
						stompClientRef.current = stompClient;
						setIsLoading(false);
					},
					(error: unknown) => {
						console.error("Error connecting to WebSocket:", error);
						setError("Failed to connect to WebSocket");
						setIsLoading(false);
					},
				);

				stompClient.onWebSocketError = (error: unknown) => {
					console.error("WebSocket error:", error);
					setError("Failed to connect to WebSocket");
					setIsLoading(false);
				};

				stompClient.onStompError = (frame) => {
					console.error("Broker error:", frame.headers.message);
					console.error("Details:", frame.body);
				};
			} catch (error) {
				console.error("Error verifying and connecting to WebSocket:", error);
				setError("Failed to connect to WebSocket");
				setIsLoading(false);
			}
		};

		verifyAndConnect();

		return () => {
			if (stompClientRef.current?.active) {
				stompClientRef.current.deactivate();
			}
		};
	}, [token]);

	if (isLoading) {
		return <AuthLoadingPage />;
	}

	if (error || !candidate) {
		return <InvalidTokenPage />;
	}

	if (!stompClientRef.current) {
		return <AuthLoadingPage />;
	}

	return (
		<WorkspaceLayout stompClient={stompClientRef.current} user={candidate} />
	);
}
