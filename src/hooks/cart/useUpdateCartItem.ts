import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type UpdateCartItemPayload = {
  isSelected?: boolean;
  quantity?: number;
};

type UpdateCartItemVariables = {
  combinationId: string;
  payload: UpdateCartItemPayload;
};

const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateCartItem,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ combinationId, payload }: UpdateCartItemVariables): Promise<void> => {
      await axiosPrivate.patch(`/cart/items/${combinationId}`, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      void queryClient.invalidateQueries({ queryKey: ['cart-selected-summary'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { updateCartItem, isPending, errorMessage };
};

export default useUpdateCartItem;
