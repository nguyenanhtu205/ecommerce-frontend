import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type PendingReview = {
  orderItemId: string;
  productId: string;
  shopId: string;
  variation: string | null;
  isReviewed: boolean;
  orderCompletedAt: string;
};

const useGetPendingReviews = () => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['review', 'pending'],

    queryFn: async (): Promise<PendingReview[]> => {
      const response = await axiosPrivate.get<PendingReview[]>('/review/pending');

      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    data,
    isLoading,
    isFetching,
    errorMessage,
    refetch,
  };
};

export default useGetPendingReviews;
