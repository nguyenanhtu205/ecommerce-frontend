import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type GetProductViewByIdResponse = {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  description: string;
  brand: string | null;
  tags: string[];
  condition: string;
  specifications: {
    title: string;
    value: string;
  }[];
  thumbnailUrl: string;
  videoUrl: string | null;
  galleryUrls: string[];
  location: string;
  categoryPath: {
    id: string;
    slug: string;
    name: string;
  }[];
  variantGroups: {
    name: string;
    options: {
      value: string;
      mediaId: string | null;
    }[];
  }[];
  variantCombinations: {
    combinationId: string;
    optionValues: string[];
    sku: string;
    price: number;
    stock: number;
  }[];
  priceMin: number;
  priceMax: number;
  originalPriceMin: number;
  discountPercent: number;
  stockTotal: number;
  isOutOfStock: boolean;
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  syncedAt: string;
  isPreOrder: boolean;
  preOrderDays: number | null;
  shippingInfo: {
    weightGrams: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
};

const useGetProductViewById = (id: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['product-view', id],
    queryFn: async (): Promise<GetProductViewByIdResponse> => {
      const response = await axiosPublic.get(`/product-catalog/products/view/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetProductViewById;
