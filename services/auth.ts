import axios from 'axios';
import { api } from './api';
import type { User, PublicSettings } from './types';
import type { LoginCredentials } from './types';

export async function getPublicSettings(serverUrl: string): Promise<PublicSettings> {
  const url = `${serverUrl.replace(/\/$/, '')}/api/v1/settings/public`;
  const response = await axios.get<PublicSettings>(url);
  return response.data;
}

export async function loginWithJellyfin(credentials: LoginCredentials): Promise<User> {
  const response = await api.post<User>('/auth/jellyfin', credentials);
  return response.data;
}

export async function validateSession(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
