import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export const ProductConditionSortBy = {
  Newest: 0,
  PriceAsc: 1,
  PriceDesc: 2,
  RatingAsc: 3,
  RatingDesc: 4,
  BestSelling: 5,
  RatingCountDesc: 6,
} as const;

export type ProductConditionSortBy =
  (typeof ProductConditionSortBy)[keyof typeof ProductConditionSortBy];

export type GetProductViewsByConditionItem = {
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

export type GetProductViewsByConditionResponse = {
  items: GetProductViewsByConditionItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type GetProductViewsByConditionParams = {
  categorySlug?: string;
  province?: string;
  sortBy?: ProductConditionSortBy;
  page: number;
  pageSize: number;
  ratingFrom?: number;
  ratingTo?: number;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
};

const useGetProductViewsByCondition = ({
  categorySlug,
  province,
  sortBy,
  page,
  pageSize,
  ratingFrom,
  ratingTo,
  priceMin,
  priceMax,
  inStockOnly,
  lowStockOnly,
}: GetProductViewsByConditionParams) => {
  const { data, isPending, error } = useQuery({
    queryKey: [
      'product-views-by-condition',
      categorySlug,
      province,
      sortBy,
      page,
      pageSize,
      ratingFrom,
      ratingTo,
      priceMin,
      priceMax,
      inStockOnly,
      lowStockOnly,
    ],
    queryFn: async (): Promise<GetProductViewsByConditionResponse> => {
      const response = await axiosPublic.get<GetProductViewsByConditionResponse>(
        `/product-catalog/products/condition`,
        {
          params: {
            CategorySlug: categorySlug,
            Province: province,
            SortBy: sortBy,
            Page: page,
            PageSize: pageSize,
            RatingFrom: ratingFrom,
            RatingTo: ratingTo,
            PriceMin: priceMin,
            PriceMax: priceMax,
            InStockOnly: inStockOnly,
            LowStockOnly: lowStockOnly,
          },
        },
      );
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetProductViewsByCondition;
