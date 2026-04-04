import { useQuery } from '@tanstack/react-query';
import { requestService } from '@/services';
import type { RequestFilter } from '@/types';

export function useRequests(filter: RequestFilter = 'all') {
  return useQuery({
    queryKey: ['requests', filter],
    queryFn: () => requestService.getRequests({ filter, sort: 'added', take: 50 }),
    staleTime: 60 * 1000,
  });
}
