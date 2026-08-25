import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetSelectedItemForCheckoutResponse = {
  items: {
    combinationId: string;
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
    thumbnailUrl: string;
    variation: string;
  }[];
  shopId: string;
  shopName: string;
}[];

const useGetSelectedItemForCheckout = () => {
  const { data, isPending, error } = useQuery({
    queryFn: async (): Promise<GetSelectedItemForCheckoutResponse> => {
      const response =
        await axiosPrivate.get<GetSelectedItemForCheckoutResponse>('/cart/selected-summary');

      return response.data;
    },
    queryKey: ['cart-selected-summary'],
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetSelectedItemForCheckout;
