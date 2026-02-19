import { create } from "zustand";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isHydrated: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  hydrate: async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        set({
          user: {
            id: session.data.user.id,
            name: session.data.user.name ?? null,
            email: session.data.user.email ?? null,
            image: session.data.user.image ?? null,
          },
          isHydrated: true,
          isLoading: false,
        });
      }
    } catch {
      set({ isHydrated: true, isLoading: false });
    }
  },

  signOut: async () => {
    await authClient.signOut();
    set({ user: null });
  },
}));
