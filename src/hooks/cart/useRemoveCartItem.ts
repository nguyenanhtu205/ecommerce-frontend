import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  const {
    mutate: removeCartItem,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (combinationId: string): Promise<void> => {
      await axiosPrivate.delete(`/cart/items/${combinationId}`);
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

  return { removeCartItem, isPending, errorMessage };
};

export default useRemoveCartItem;
