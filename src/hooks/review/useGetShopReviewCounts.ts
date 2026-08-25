import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetShopReviewCountsResponse = {
  all: number;
  toReply: number;
  replied: number;
  stars: Record<number, number>;
};

const useGetShopReviewCounts = () => {
  const {
    data: counts,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['review', 'shop', 'counts'],

    queryFn: async (): Promise<GetShopReviewCountsResponse> => {
      const response = await axiosPrivate.get<GetShopReviewCountsResponse>('/review/shop/counts');

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
    counts,
    isLoading,
    isFetching,
    errorMessage,
  };
};

export default useGetShopReviewCounts;
