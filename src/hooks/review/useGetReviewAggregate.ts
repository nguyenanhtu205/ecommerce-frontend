import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type ReviewAggregateResponse = {
  productId: string;
  ratingAverage: number;
  ratingCount: number;
  starCounts: Record<string, number>;
  commentCount: number;
  mediaCount: number;
  updatedAt: string;
};

const useGetReviewAggregate = (productId: string) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['review', productId, 'aggregate'],

    queryFn: async (): Promise<ReviewAggregateResponse> => {
      const response = await axiosPublic.get<ReviewAggregateResponse>(
        `/review/products/${productId}/aggregate`,
      );

      return response.data;
    },

    enabled: !!productId,
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

export default useGetReviewAggregate;
