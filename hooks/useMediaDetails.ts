import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';
import type { MovieDetails, TvDetails } from '@/types';

export function useMediaDetails(id: number, type: 'movie' | 'tv') {
  return useQuery<MovieDetails | TvDetails>({
    queryKey: ['media', type, id],
    queryFn: () =>
      type === 'movie' ? mediaService.getMovieDetails(id) : mediaService.getTvDetails(id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}
