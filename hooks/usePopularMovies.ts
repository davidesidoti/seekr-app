import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';

export function usePopularMovies(sortBy = 'popularity.desc', genre?: number) {
  return useQuery({
    queryKey: ['popular', 'movies', sortBy, genre ?? null],
    queryFn: () => mediaService.getPopularMovies(1, undefined, sortBy, genre),
    staleTime: 5 * 60 * 1000,
  });
}
