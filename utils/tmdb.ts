const TMDB_BASE = 'https://image.tmdb.org/t/p/';

export const tmdbImage = {
  poster: (path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'original' = 'w342') =>
    path ? `${TMDB_BASE}${size}${path}` : null,

  backdrop: (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `${TMDB_BASE}${size}${path}` : null,

  avatar: (path: string | null) =>
    path ? `${TMDB_BASE}w185${path}` : null,
} as const;
