import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '@/services';

export function useManageRequest() {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['requests'] });
    queryClient.invalidateQueries({ queryKey: ['media'] });
  }

  const approve = useMutation({
    mutationFn: (id: number) => requestService.approveRequest(id),
    onSuccess: invalidate,
  });

  const decline = useMutation({
    mutationFn: (id: number) => requestService.declineRequest(id),
    onSuccess: invalidate,
  });

  return { approve, decline };
}
