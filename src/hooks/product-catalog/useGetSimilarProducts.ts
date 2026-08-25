import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type GetSimilarProductsItem = {
  id: string;
  name: string;
  thumbnailUrl: string;
  priceMin: number;
  priceMax: number;
  originalPriceMin: number | null;
  discountPercent: number | null;
  isOutOfStock: boolean;
  stockTotal: number;
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  location: string;
};

export type GetSimilarProductsResponse = GetSimilarProductsItem[];

export type GetSimilarProductsParams = {
  productId: string;
};

const useGetSimilarProducts = ({ productId }: GetSimilarProductsParams) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['similar-products', productId],
    queryFn: async (): Promise<GetSimilarProductsResponse> => {
      const response = await axiosPublic.get(`/product-catalog/products/${productId}/similar`);
      return response.data;
    },
    enabled: !!productId,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetSimilarProducts;
