import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  authChecked: boolean;
  setUser: (user: User | null) => void;
  setAuthChecked: (checked: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        authChecked: false,
        setUser: (user) => set({ user }),
        setAuthChecked: (authChecked) => set({ authChecked }),
        clearAuth: () => set({ user: null, authChecked: true }),
      }),
      {
        name: 'forametric-auth',
        // Only persist authChecked — never persist the user object (security)
        partialize: (state) => ({ authChecked: state.authChecked }),
      }
    ),
    { name: 'AuthStore' }
  )
);
