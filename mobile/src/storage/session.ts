import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '../types/api';

const TOKEN_KEY = 'subradar.token';
const USER_KEY = 'subradar.user';

export interface StoredSession {
  token: string;
  user: AuthUser;
}

export const getToken = (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY);

export const saveSession = async (session: StoredSession): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, session.token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user));
};

export const loadSession = async (): Promise<StoredSession | null> => {
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);
  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) as AuthUser };
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
};
