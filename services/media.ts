import { api } from './api';
import type { PaginatedResponse, MediaResult, MovieDetails, TvDetails } from './types';

export async function getTrending(
  page = 1,
  language?: string,
): Promise<PaginatedResponse<MediaResult>> {
  const response = await api.get<PaginatedResponse<MediaResult>>('/discover/trending', {
    params: { page, language },
  });
  return response.data;
}

export async function getPopularMovies(
  page = 1,
  language?: string,
): Promise<PaginatedResponse<MediaResult>> {
  const response = await api.get<PaginatedResponse<MediaResult>>('/discover/movies', {
    params: { page, language },
  });
  return response.data;
}

export async function getPopularTv(
  page = 1,
  language?: string,
): Promise<PaginatedResponse<MediaResult>> {
  const response = await api.get<PaginatedResponse<MediaResult>>('/discover/tv', {
    params: { page, language },
  });
  return response.data;
}

export async function search(
  query: string,
  page = 1,
  language?: string,
): Promise<PaginatedResponse<MediaResult>> {
  const response = await api.get<PaginatedResponse<MediaResult>>('/search', {
    params: { query, page, language },
  });
  // Filter out person results — app only displays movie/tv
  return {
    ...response.data,
    results: response.data.results.filter((r) => r.mediaType !== 'person'),
  };
}

export async function getMovieDetails(tmdbId: number): Promise<MovieDetails> {
  const response = await api.get<MovieDetails>(`/movie/${tmdbId}`);
  return response.data;
}

export async function getTvDetails(tmdbId: number): Promise<TvDetails> {
  const response = await api.get<TvDetails>(`/tv/${tmdbId}`);
  return response.data;
}

export async function getRecommendations(
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  page = 1,
): Promise<PaginatedResponse<MediaResult>> {
  const response = await api.get<PaginatedResponse<MediaResult>>(
    `/${mediaType}/${tmdbId}/recommendations`,
    { params: { page } },
  );
  return response.data;
}
