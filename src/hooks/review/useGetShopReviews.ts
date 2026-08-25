import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type ShopReviewStatus = 'all' | 'to_reply' | 'replied';

const STATUS_MAP: Record<ShopReviewStatus, number> = {
  all: 0,
  to_reply: 1,
  replied: 2,
};

type GetShopReviewsResponse = {
  id: string;
  orderItemId: string;
  productId: string;
  buyerId: string;
  buyerDisplayName: string;
  rating: number;
  variation: string | null;
  attributes: {
    label: string;
    value: string;
  }[];
  comment: string;
  mediaAssetIds: string[];
  likeCount: number;
  createdAt: string;
  sellerReply: {
    content: string;
    repliedAt: string;
  } | null;
}[];

type GetShopReviewsParams = {
  ratings?: number[];
  status?: ShopReviewStatus;
  page?: number;
  pageSize?: number;
};

const useGetShopReviews = (params?: GetShopReviewsParams) => {
  const {
    data: reviews,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['review', 'shop', params],

    queryFn: async (): Promise<GetShopReviewsResponse> => {
      const response = await axiosPrivate.post<GetShopReviewsResponse>('/review/shop', {
        ratings: params?.ratings,
        status: STATUS_MAP[params?.status ?? 'all'],
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      });

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
    reviews: reviews ?? [],
    isLoading,
    isFetching,
    errorMessage,
  };
};

export default useGetShopReviews;
