import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

const useDeleteReview = () => {
  const queryClient = useQueryClient();

  const {
    mutate: deleteReview,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (reviewId: string): Promise<void> => {
      await axiosPrivate.delete(`/review/${reviewId}`);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['review'],
      });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    deleteReview,
    isPending,
    errorMessage,
  };
};

export default useDeleteReview;
