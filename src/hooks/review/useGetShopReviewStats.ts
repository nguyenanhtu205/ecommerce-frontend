import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetShopReviewStatsResponse = {
  totalReviews: number;
  totalReviewsTrendPercent: number;
  orderReviewRate: number;
  goodReviewRate: number;
  needReplyCount: number;
  overallRating: number;
};

const useGetShopReviewStats = () => {
  const {
    data: stats,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['review', 'shop', 'stats'],

    queryFn: async (): Promise<GetShopReviewStatsResponse> => {
      const response = await axiosPrivate.get<GetShopReviewStatsResponse>('/review/shop/stats');

      return response.data;
    },
  });

  const errorMessage = error
    ? ((
        error as {
          response?: {
            data?: {
              detail?: string;
            };
          };
        }
      ).response?.data?.detail ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    stats,
    isLoading,
    isFetching,
    errorMessage,
  };
};

export default useGetShopReviewStats;
