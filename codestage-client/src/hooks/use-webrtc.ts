import type { Client } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";

interface WebRTCSignal {
	type: "offer" | "answer" | "ice-candidate";
	payload: string;
}

const RTC_CONFIG: RTCConfiguration = {
	iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTC(
	stompClient: Client,
	sessionId: string,
	isAdmin: boolean,
	localStream: MediaStream | null,
) {
	const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
	const pcRef = useRef<RTCPeerConnection | null>(null);
	const makingOfferRef = useRef(false);

	useEffect(() => {
		if (!stompClient.connected || !sessionId) return;
		if (!isAdmin && !localStream) return;

		const pc = new RTCPeerConnection(RTC_CONFIG);
		pcRef.current = pc;

		const remote = new MediaStream();
		setRemoteStream(remote);

		pc.ontrack = (event) => {
			for (const track of event.streams[0]?.getTracks() ?? []) {
				remote.addTrack(track);
			}
		};

		const sendSignal = (signal: WebRTCSignal) => {
			if (stompClient.connected) {
				stompClient.publish({
					destination: `/app/${sessionId}/webrtc-signal`,
					body: JSON.stringify(signal),
				});
			}
		};

		pc.onicecandidate = (event) => {
			if (event.candidate) {
				sendSignal({
					type: "ice-candidate",
					payload: JSON.stringify(event.candidate),
				});
			}
		};

		const handleSignal = async (signal: WebRTCSignal) => {
			try {
				if (signal.type === "offer" && isAdmin) {
					await pc.setRemoteDescription(
						new RTCSessionDescription(JSON.parse(signal.payload)),
					);
					const answer = await pc.createAnswer();
					await pc.setLocalDescription(answer);
					sendSignal({
						type: "answer",
						payload: JSON.stringify(answer),
					});
				} else if (signal.type === "answer" && !isAdmin) {
					await pc.setRemoteDescription(
						new RTCSessionDescription(JSON.parse(signal.payload)),
					);
				} else if (signal.type === "ice-candidate") {
					await pc.addIceCandidate(
						new RTCIceCandidate(JSON.parse(signal.payload)),
					);
				}
			} catch (err) {
				console.error("WebRTC signal error:", err);
			}
		};

		const sub = stompClient.subscribe(
			`/topic/${sessionId}/webrtc-signal`,
			(message) => {
				const signal: WebRTCSignal = JSON.parse(message.body);
				handleSignal(signal);
			},
		);

		if (!isAdmin && localStream) {
			for (const track of localStream.getTracks()) {
				pc.addTrack(track, localStream);
			}

			const createOffer = async () => {
				if (makingOfferRef.current) return;
				makingOfferRef.current = true;
				try {
					const offer = await pc.createOffer();
					await pc.setLocalDescription(offer);
					sendSignal({
						type: "offer",
						payload: JSON.stringify(offer),
					});
				} finally {
					makingOfferRef.current = false;
				}
			};

			createOffer();
		}

		return () => {
			sub.unsubscribe();
			pc.close();
			pcRef.current = null;
		};
	}, [stompClient, sessionId, isAdmin, localStream]);

	return { remoteStream };
}
