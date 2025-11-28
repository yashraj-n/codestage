import { useAuthTokenStore } from "@/stores/auth-store";
import { AdminControllerApi, Configuration } from "./generated-api";

export const config = new Configuration({
	basePath: import.meta.env.VITE_PUBLIC_SERVER_URL,
	accessToken: () => {
		return useAuthTokenStore.getState().token ?? "";
	},
});

export const adminApi = new AdminControllerApi(config);
