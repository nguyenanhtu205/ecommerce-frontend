import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type SearchPayload = {
  q?: string;
  priceMin?: number;
  priceMax?: number;
  category?: string;
  sort?: `${'price' | 'rating' | 'soldCount'}:${'asc' | 'desc'}` | 'price' | 'rating' | 'soldCount';
  page?: number;
  size?: number;
  location?: string;
};

export type SearchResponse = {
  total: number;
  items: {
    productId: string;
    shopId: string;
    shopName: string;
    name: string;
    description: string;
    brand: string | null;
    tags: string[];
    searchableSpecs: string;
    thumbnailUrl: string;
    location: string;
    categoryPath: {
      id: string;
      name: string;
    }[];
    priceMin: string;
    priceMax: string;
    originalPriceMin: string | null;
    discountPercent: number | null;
    stockTotal: number;
    isOutOfStock: boolean;
    ratingAverage: number;
    ratingCount: number;
    soldCount: number;
    syncedAt: string;
  }[];
};

const useSearch = (payload: SearchPayload) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['search', payload],
    queryFn: async (): Promise<SearchResponse> => {
      const response = await axiosPublic.get('/search', { params: payload });
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Tìm kiếm thất bại. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useSearch;
