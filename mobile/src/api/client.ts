import axios, { AxiosError } from 'axios';
import { clearSession, getToken } from '../storage/session';
import type { ApiErrorBody } from '../types/api';

export const API_BASE_URL = 'http://192.168.0.22:3999/api';

type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

// The auth store registers here so a 401 resets in-memory state without a circular import.
export const setUnauthorizedListener = (listener: UnauthorizedListener | null): void => {
  unauthorizedListener = listener;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/') ?? false;
    if (error.response?.status === 401 && !isAuthEndpoint) {
      await clearSession();
      unauthorizedListener?.();
    }
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'Cannot reach the server. Check your connection.';
    const body = error.response.data;
    const first = body?.errors?.[0];
    return first ? first.message : (body?.message ?? 'Something went wrong');
  }
  return error instanceof Error ? error.message : 'Something went wrong';
};
