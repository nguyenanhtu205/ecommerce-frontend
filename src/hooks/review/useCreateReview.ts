import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type CreateReviewPayload = {
  orderItemId: string;
  rating: number;
  comment: string;
  attributes: {
    label: string;
    value: string;
  }[];
  mediaAttachments: {
    mediaAssetId: string;
    role: string;
    position: number;
  }[];
};

type CreateReviewResponse = {
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
};

const useCreateReview = () => {
  const queryClient = useQueryClient();

  const {
    mutate: createReview,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: CreateReviewPayload): Promise<CreateReviewResponse> => {
      const response = await axiosPrivate.post<CreateReviewResponse>('/review', payload);
      return response.data;
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

  return { createReview, isPending, errorMessage };
};

export default useCreateReview;
