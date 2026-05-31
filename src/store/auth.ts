import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setSession: (user, token) => {
        window.localStorage.setItem("afg.token", token);
        set({ user, token });
      },
      logout: () => {
        window.localStorage.removeItem("afg.token");
        set({ user: null, token: null });
      },
      hasRole: (...roles) => {
        const u = get().user;
        return !!u && roles.includes(u.role);
      },
    }),
    {
      name: "afg.auth",
    }
  )
);
