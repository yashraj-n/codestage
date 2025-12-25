import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JwtUser } from "@/lib/generated-api/models/JwtUser";

interface AuthToken {
	token: string;
	setToken: (token: string) => void;
	removeToken: () => void;
}

interface AuthState {
	admin: JwtUser | null;
	setAdmin: (admin: JwtUser) => void;
	signOut: () => void;
}

export const useAuthTokenStore = create<AuthToken>()(
	persist(
		(set) => ({
			token: "",
			setToken: (token: string) => set({ token }),
			removeToken: () => set({ token: "" }),
		}),
		{
			name: "codestage-auth-token",
			partialize: (state) => ({ token: state.token }),
		},
	),
);

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			admin: null,
			setAdmin: (admin: JwtUser) => set({ admin }),
			signOut: () => {
				useAuthTokenStore.getState().removeToken();
				set({ admin: null });
			},
		}),
		{
			name: "codestage-admin",
			partialize: (state) => ({ admin: state.admin }),
		},
	),
);
