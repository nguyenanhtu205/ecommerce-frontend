import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

const useRemoveCartItems = () => {
  const queryClient = useQueryClient();

  const {
    mutate: removeCartItems,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (combinationIds: string[]): Promise<void> => {
      await axiosPrivate.delete('/cart/items', { data: { combinationIds } });
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

  return { removeCartItems, isPending, errorMessage };
};

export default useRemoveCartItems;
