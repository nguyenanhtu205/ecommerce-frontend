import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type AddToCartPayload = {
  combinationId: string;
  isSelected: boolean;
  priceSnapshot: number;
  productId: string;
  productName: string;
  quantity: number;
  shippingInfo: {
    dimensions: {
      height: number;
      length: number;
      width: number;
    };
    weightGrams: number;
  };
  shopId: string;
  shopName: string;
  thumbnailUrl: string;
  variation: string;
};

const useAddToCart = () => {
  const queryClient = useQueryClient();

  const {
    mutate: addToCart,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: AddToCartPayload): Promise<void> => {
      await axiosPrivate.post('/cart/items', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      void queryClient.invalidateQueries({ queryKey: ['cart-selected-summary'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { addToCart, isPending, errorMessage };
};

export default useAddToCart;
