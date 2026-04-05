import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';

export function usePopularTv(sortBy = 'popularity.desc', genre?: number) {
  return useQuery({
    queryKey: ['popular', 'tv', sortBy, genre ?? null],
    queryFn: () => mediaService.getPopularTv(1, undefined, sortBy, genre),
    staleTime: 5 * 60 * 1000,
  });
}
