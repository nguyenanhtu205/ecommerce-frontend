import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type ReplyReviewPayload = {
  reviewId: string;
  content: string;
};

const useReplyReview = () => {
  const queryClient = useQueryClient();

  const {
    mutate: replyReview,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: ReplyReviewPayload): Promise<void> => {
      await axiosPrivate.patch(`/review/${payload.reviewId}/reply`, payload);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['review', 'shop'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    replyReview,
    isPending,
    errorMessage,
  };
};

export default useReplyReview;
