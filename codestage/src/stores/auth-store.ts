import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminUser {
	id: string;
	email: string;
	name: string;
	photoURL: string | null;
}

interface AuthState {
	admin: AdminUser | null;
	isLoading: boolean;
	signInWithGoogle: () => Promise<void>;
	signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			admin: null,
			isLoading: false,

			signInWithGoogle: async () => {
				set({ isLoading: true });

				await new Promise((resolve) => setTimeout(resolve, 1500));

				const mockAdmin: AdminUser = {
					id: crypto.randomUUID(),
					email: "admin@codestage.io",
					name: "CodeStage Admin",
					photoURL: null,
				};

				set({ admin: mockAdmin, isLoading: false });
			},

			signOut: () => {
				set({ admin: null });
			},
		}),
		{
			name: "codestage-admin",
			partialize: (state) => ({ admin: state.admin }),
		},
	),
);
