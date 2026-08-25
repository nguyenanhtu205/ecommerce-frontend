import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type GetShopGroupedCartResponse = {
  items: {
    addedAt: string;
    combinationId: string;
    isSelected: boolean;
    priceSnapshot: number;
    productId: string;
    productName: string;
    quantity: number;
    shopId: string;
    thumbnailUrl: string;
    variation: string;
  }[];
  shopId: string;
  shopName: string;
}[];

const useGetShopGroupedCart = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async (): Promise<GetShopGroupedCartResponse> => {
      const response = await axiosPrivate.get<GetShopGroupedCartResponse>('/cart');
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopGroupedCart;
