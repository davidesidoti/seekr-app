import type { MediaType, RequestStatusValue, MediaStatusValue } from './media';

export type RequestFilter =
  | 'all'
  | 'approved'
  | 'available'
  | 'pending'
  | 'processing'
  | 'unavailable'
  | 'failed';

export interface MediaRequest {
  id: number;
  status: RequestStatusValue;
  media: {
    tmdbId: number;
    mediaType: MediaType;
    status: MediaStatusValue;
  };
  requestedBy: {
    id: number;
    username: string;
    avatar: string | null;
  };
  seasons?: { seasonNumber: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovieRequest {
  mediaType: 'movie';
  mediaId: number;
  is4k: boolean;
  serverId?: number;
  profileId?: number;
  rootFolder?: string;
}

export interface CreateTvRequest {
  mediaType: 'tv';
  mediaId: number;
  is4k: boolean;
  seasons: number[];
  serverId?: number;
  profileId?: number;
  rootFolder?: string;
}

export interface RequestCount {
  total: number;
  movie: number;
  tv: number;
  pending: number;
  approved: number;
  declined: number;
  processing: number;
  available: number;
}
