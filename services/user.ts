import { api } from './api';
import type { User, UserQuota } from './types';

export async function getProfile(userId: number): Promise<User> {
  const response = await api.get<User>(`/user/${userId}`);
  return response.data;
}

export async function getQuota(userId: number): Promise<UserQuota> {
  const response = await api.get<UserQuota>(`/user/${userId}/quota`);
  return response.data;
}
