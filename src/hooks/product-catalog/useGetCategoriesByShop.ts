import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type GetCategoriesByShopItem = {
  id: string;
  name: string;
};

export type GetCategoriesByShopResponse = GetCategoriesByShopItem[];

export type GetCategoriesByShopParams = {
  shopId: string;
};

const useGetCategoriesByShop = ({ shopId }: GetCategoriesByShopParams) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['categories-by-shop', shopId],
    queryFn: async (): Promise<GetCategoriesByShopResponse> => {
      const response = await axiosPublic.get(`/product-catalog/categories/shop/${shopId}`);
      return response.data;
    },
    enabled: !!shopId,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetCategoriesByShop;
