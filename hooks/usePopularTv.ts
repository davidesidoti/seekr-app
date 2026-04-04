import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';

export function usePopularTv() {
  return useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: () => mediaService.getPopularTv(),
    staleTime: 5 * 60 * 1000,
  });
}
