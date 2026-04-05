import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './secureStorage';
import type { User } from '@/types';

interface PersistedAuth {
  serverUrl: string | null;
  apiKey: string | null;
  user: Pick<User, 'id' | 'email' | 'username' | 'avatar' | 'permissions' | 'userType'> | null;
}

interface AuthState extends PersistedAuth {
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  setServer: (url: string) => void;
  login: (user: User, apiKey?: string) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      serverUrl: null,
      apiKey: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      setServer: (url) => set({ serverUrl: url.replace(/\/$/, '') }),

      login: (user, apiKey) =>
        set({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            permissions: user.permissions,
            userType: user.userType,
          },
          apiKey: apiKey ?? null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          apiKey: null,
          isAuthenticated: false,
        }),

      setHydrated: () =>
        set((state) => ({
          isHydrated: true,
          isAuthenticated: !!state.user && !!state.serverUrl,
        })),
    }),
    {
      name: 'seekr-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state): PersistedAuth => ({
        serverUrl: state.serverUrl,
        apiKey: state.apiKey,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    },
  ),
);
