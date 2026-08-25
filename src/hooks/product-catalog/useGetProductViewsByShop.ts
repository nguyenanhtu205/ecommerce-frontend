import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export const ProductSortBy = {
  Newest: 0,
  PriceAsc: 1,
  PriceDesc: 2,
  RatingAsc: 3,
  RatingDesc: 4,
  BestSelling: 5,
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];

export type GetProductViewsByShopItem = {
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

export type GetProductViewsByShopResponse = {
  items: GetProductViewsByShopItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type GetProductViewsByShopParams = {
  shopId: string;
  productId?: string;
  categoryId?: string;
  sortBy?: ProductSortBy;
  page?: number;
  pageSize?: number;
};

const useGetProductViewsByShop = ({
  shopId,
  productId,
  categoryId,
  sortBy,
  page,
  pageSize,
}: GetProductViewsByShopParams) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['product-views-by-shop', shopId, productId, categoryId, sortBy, page, pageSize],
    queryFn: async (): Promise<GetProductViewsByShopResponse> => {
      const response = await axiosPublic.get(`/product-catalog/products/shop/${shopId}`, {
        params: {
          ProductId: productId,
          CategoryId: categoryId,
          SortBy: sortBy,
          Page: page,
          PageSize: pageSize,
        },
      });
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

export default useGetProductViewsByShop;
