import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetReviewResponse = {
  id: string;
  orderItemId: string;
  productId: string;
  shopId: string;
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
  isLikedByCurrentUser: boolean;
}[];

type GetReviewsByProductParams = {
  rating?: number;
  hasComment?: boolean;
  hasMedia?: boolean;
  page?: number;
  pageSize?: number;
};

const useGetReviewByProduct = (productId: string, params?: GetReviewsByProductParams) => {
  const {
    data: reviews,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['review', productId, params],

    queryFn: async (): Promise<GetReviewResponse> => {
      const response = await axiosPrivate.get<GetReviewResponse>(`/review/products/${productId}`, {
        params: {
          Rating: params?.rating,
          HasComment: params?.hasComment,
          HasMedia: params?.hasMedia,
          Page: params?.page,
          PageSize: params?.pageSize,
        },
      });

      return response.data;
    },

    enabled: !!productId,
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

export default useGetReviewByProduct;
