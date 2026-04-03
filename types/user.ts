import type { UserTypeValue } from './media';

export interface User {
  id: number;
  email: string;
  username: string;
  userType: UserTypeValue;
  permissions: number;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
}

export interface UserQuota {
  movie: {
    limit: number;
    used: number;
    remaining: number;
    days: number;
  };
  tv: {
    limit: number;
    used: number;
    remaining: number;
    days: number;
  };
}

export interface PublicSettings {
  initialized: boolean;
  appTitle: string;
  applicationUrl: string;
  localLogin: boolean;
  movie4kEnabled: boolean;
  series4kEnabled: boolean;
  region: string;
  originalLanguage: string;
  mediaServerType: number;
  jellyfinHost?: string;
}
