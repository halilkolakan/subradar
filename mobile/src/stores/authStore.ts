import { create } from 'zustand';
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth';
import { setUnauthorizedListener } from '../api/client';
import { queryClient } from '../api/queryClient';
import { clearSession, loadSession, saveSession } from '../storage/session';
import type { AuthResult, AuthUser } from '../types/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const signedOut = { user: null, token: null, isAuthenticated: false } as const;

export const useAuthStore = create<AuthState>((set) => {
  const establishSession = async ({ user, token }: AuthResult): Promise<void> => {
    await saveSession({ user, token });
    set({ user, token, isAuthenticated: true });
  };

  return {
    ...signedOut,
    isRestoring: true,

    login: async (payload) => {
      await establishSession(await authApi.login(payload));
    },

    register: async (payload) => {
      await establishSession(await authApi.register(payload));
    },

    logout: async () => {
      await clearSession();
      queryClient.clear();
      set({ ...signedOut });
    },

    restoreSession: async () => {
      const session = await loadSession();
      set(
        session
          ? { user: session.user, token: session.token, isAuthenticated: true, isRestoring: false }
          : { ...signedOut, isRestoring: false },
      );
    },
  };
});

setUnauthorizedListener(() => {
  queryClient.clear();
  useAuthStore.setState({ ...signedOut });
});
