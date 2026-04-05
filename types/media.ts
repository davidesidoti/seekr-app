export type MediaType = 'movie' | 'tv' | 'person';

export const MediaStatus = {
  UNKNOWN:             1,
  PENDING:             2,
  PROCESSING:          3,
  PARTIALLY_AVAILABLE: 4,
  AVAILABLE:           5,
  DELETED:             6,
} as const;
export type MediaStatusValue = (typeof MediaStatus)[keyof typeof MediaStatus];

export const RequestStatus = {
  PENDING_APPROVAL: 1,
  APPROVED:         2,
  DECLINED:         3,
} as const;
export type RequestStatusValue = (typeof RequestStatus)[keyof typeof RequestStatus];

export const UserType = {
  PLEX:     1,
  JELLYFIN: 2,
  LOCAL:    3,
  EMBY:     4,
} as const;
export type UserTypeValue = (typeof UserType)[keyof typeof UserType];

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface Season {
  id: number;
  seasonNumber: number;
  episodeCount: number;
  name: string;
  airDate: string | null;
  posterPath: string | null;
}

export interface SeasonMediaInfo {
  seasonNumber: number;
  status: MediaStatusValue;
}

export interface MediaRequestSummary {
  id: number;
  status: RequestStatusValue;
  requestedBy: { id: number; username: string | null; displayName?: string | null; email?: string | null };
  createdAt: string;
}

export interface MediaInfo {
  id: number;
  tmdbId: number;
  status: MediaStatusValue;
  seasons?: SeasonMediaInfo[];
  requests: MediaRequestSummary[];
}

export interface MediaResult {
  id: number;
  mediaType: MediaType;
  popularity: number;
  posterPath: string | null;
  backdropPath: string | null;
  title?: string;
  name?: string;
  originalTitle?: string;
  overview: string;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  mediaInfo?: MediaInfo;
}

export interface MovieDetails {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  runtime: number;
  voteAverage: number;
  genres: Genre[];
  credits: { cast: CastMember[] };
  mediaInfo?: MediaInfo;
}

export interface TvDetails {
  id: number;
  name: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string;
  episodeRunTime: number[];
  status: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  voteAverage: number;
  genres: Genre[];
  credits: { cast: CastMember[] };
  seasons: Season[];
  mediaInfo?: MediaInfo;
}
