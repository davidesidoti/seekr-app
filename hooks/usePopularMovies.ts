import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';

export function usePopularMovies() {
  return useQuery({
    queryKey: ['popular', 'movies'],
    queryFn: () => mediaService.getPopularMovies(),
    staleTime: 5 * 60 * 1000,
  });
}
