import { api } from './api';
import type {
  MediaRequest,
  CreateMovieRequest,
  CreateTvRequest,
  RequestCount,
  RequestFilter,
  PaginatedRequest,
} from './types';

export async function createRequest(
  body: CreateMovieRequest | CreateTvRequest,
): Promise<MediaRequest> {
  const response = await api.post<MediaRequest>('/request', body);
  return response.data;
}

export async function getRequests(params?: {
  take?: number;
  skip?: number;
  filter?: RequestFilter;
  sort?: string;
  requestedBy?: number;
}): Promise<PaginatedRequest<MediaRequest>> {
  const response = await api.get<PaginatedRequest<MediaRequest>>('/request', { params });
  return response.data;
}

export async function getRequestCount(): Promise<RequestCount> {
  const response = await api.get<RequestCount>('/request/count');
  return response.data;
}

export async function approveRequest(requestId: number): Promise<MediaRequest> {
  const response = await api.post<MediaRequest>(`/request/${requestId}/approve`);
  return response.data;
}

export async function declineRequest(requestId: number): Promise<MediaRequest> {
  const response = await api.post<MediaRequest>(`/request/${requestId}/decline`);
  return response.data;
}

export async function deleteRequest(requestId: number): Promise<void> {
  await api.delete(`/request/${requestId}`);
}
