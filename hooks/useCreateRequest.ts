import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestService } from '@/services';
import type { CreateMovieRequest, CreateTvRequest } from '@/types';

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMovieRequest | CreateTvRequest) =>
      requestService.createRequest(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['media', variables.mediaType, variables.mediaId],
      });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}
