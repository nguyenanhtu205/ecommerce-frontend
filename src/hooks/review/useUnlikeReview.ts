import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

const useUnlikeReview = () => {
  const queryClient = useQueryClient();

  const {
    mutate: unlikeReview,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (reviewId: string): Promise<void> => {
      await axiosPrivate.post(`/review/${reviewId}/like`);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['review'],
        refetchType: 'none',
      });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    unlikeReview,
    isPending,
    errorMessage,
  };
};

export default useUnlikeReview;
