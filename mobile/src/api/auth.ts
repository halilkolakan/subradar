import { apiClient } from './client';
import type { ApiSuccess, AuthResult } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/login', payload);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiSuccess<AuthResult>>('/auth/register', payload);
    return data.data;
  },
};
