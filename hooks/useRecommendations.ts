import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';

export function useRecommendations(id: number, type: 'movie' | 'tv') {
  return useQuery({
    queryKey: ['recommendations', type, id],
    queryFn: () => mediaService.getRecommendations(type, id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}
