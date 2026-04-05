import { useAuthTokenStore } from "@/stores/auth-store";
import { AdminControllerApi, AssessmentControllerApi, Configuration } from "./generated-api";
import type { Middleware } from "./generated-api/runtime";

const authMiddleware: Middleware = {
	pre: async (context) => {
		const token = useAuthTokenStore.getState().token;
		if (token) {
			return {
				url: context.url,
				init: {
					...context.init,
					headers: {
						...context.init.headers,
						Authorization: `Bearer ${token}`,
					},
				},
			};
		}
		return context;
	},
};

export const config = new Configuration({
	basePath: import.meta.env.VITE_PUBLIC_SERVER_URL,
});

export const adminApi = new AdminControllerApi(config).withMiddleware(authMiddleware);
export const assessmentsApi = new AssessmentControllerApi(config).withMiddleware(authMiddleware);
