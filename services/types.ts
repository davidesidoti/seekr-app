export type {
  PaginatedResponse,
  PaginatedRequest,
  PageInfo,
  ApiError,
  MediaType,
  MediaStatusValue,
  RequestStatusValue,
  MediaResult,
  MovieDetails,
  TvDetails,
  Season,
  CastMember,
  Genre,
  MediaInfo,
  MediaRequest,
  CreateMovieRequest,
  CreateTvRequest,
  RequestCount,
  RequestFilter,
  User,
  UserQuota,
  PublicSettings,
} from '@/types';

export { MediaStatus, RequestStatus, UserType } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
  hostname?: string;
}
