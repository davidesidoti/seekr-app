import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: () => mediaService.getTrending(),
    staleTime: 5 * 60 * 1000,
  });
}
