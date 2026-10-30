import type { User } from '../types/api.ts';
import client from './client.ts';

type MeResponse = {
  user: {
    _id?: string;
    id?: string;
    email?: string;
    contactName?: string;
    phone?: string;
    businessName?: string;
    businessType?: string;
    role?: string;
  };
};

export const authApi = {
  login: (email: string, password: string) =>
    client.post<{ message: string }>('/auth/login-email', { email, password }),
  logout: () => client.post('/auth/logout'),
  me: () => client.get<MeResponse>('/auth/me'),
  refresh: () => client.post('/auth/refresh-token'),
  forgotPassword: (email: string) =>
    client.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    client.post<{ message: string }>('/auth/reset-password', { token, password }),
};

export type { User };
