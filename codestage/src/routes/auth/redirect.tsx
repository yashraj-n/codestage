import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthLoadingPage, InvalidTokenPage } from "@/components/token-redirect";
import { adminApi } from "@/lib/api-client";
import { useAuthStore, useAuthTokenStore } from "@/stores/auth-store";

export const Route = createFileRoute("/auth/redirect")({
	component: RouteComponent,
	validateSearch: (search) => {
		return {
			token: search.token as string,
		};
	},
});

function RouteComponent() {
	const { token } = useSearch({ from: "/auth/redirect" });
	const { setToken } = useAuthTokenStore();
	const { setAdmin } = useAuthStore();

	const { data, isLoading, error } = useQuery({
		queryKey: ["admin-data"],
		queryFn: () => adminApi.getAdmin(),
		enabled: !!token,
	});

	useEffect(() => {
		if (token) {
			setToken(token);
		}
	}, [token, setToken]);

	useEffect(() => {
		if (data) {
			setAdmin(data);
		}
	}, [data, setAdmin]);

	if (!token) {
		return <InvalidTokenPage />;
	}

	if (isLoading) {
		return <AuthLoadingPage />;
	}

	if (error) {
		return <InvalidTokenPage />;
	}

	return <Navigate to="/admin/dashboard" />;
}
