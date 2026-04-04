import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => mediaService.search(query),
    enabled: query.length >= 3,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}
