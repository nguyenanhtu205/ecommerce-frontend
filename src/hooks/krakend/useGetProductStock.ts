import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type VariantOption = {
  value: string;
  mediaId: string | null;
};

export type VariantGroup = {
  name: string;
  options: VariantOption[];
};

export type VariantCombination = {
  combinationId: string;
  optionValues: string[];
  sku: string;
};

export type ProductSpecification = {
  attributeId: string;
  title: string;
  value: string;
};

export type ProductDimensions = {
  length: number;
  width: number;
  height: number;
};

export type ProductShippingInfo = {
  weightGrams: number;
  dimensions: ProductDimensions;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: number;
  thumbnailMediaId: string;
  videoMediaId: string | null;
  galleryMediaIds: string[];
  specifications: ProductSpecification[];
  variantGroups: VariantGroup[];
  variantCombinations: VariantCombination[];
  shippingInfo: ProductShippingInfo;
};

export type Stock = {
  id: string;
  productId: string;
  price: number;
  stock: number;
  reservedStock: number;
};

export type ProductWithStock = Product & {
  stocks: Stock[];
  totalStock: number;
};

type GetProductStockResponse = {
  products?: Product[];
  stocks?: Stock[];
};

const REFETCH_INTERVAL_MS = 15000;

const useGetProductStock = (options?: { enabled?: boolean }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['seller-product-stock'],
    queryFn: async (): Promise<ProductWithStock[]> => {
      const response = await axiosPrivate.get<GetProductStockResponse>('gateway/seller/products');
      const { products, stocks } = response.data;

      if (!products || !stocks) {
        throw new Error(
          !products && !stocks
            ? 'Không thể tải dữ liệu sản phẩm và tồn kho.'
            : !products
              ? 'Không thể tải dữ liệu sản phẩm.'
              : 'Không thể tải dữ liệu tồn kho.',
        );
      }

      const stocksByProductId = new Map<string, Stock[]>();
      for (const stock of stocks) {
        const list = stocksByProductId.get(stock.productId) ?? [];
        list.push(stock);
        stocksByProductId.set(stock.productId, list);
      }

      return products.map((product) => {
        const productStocks = stocksByProductId.get(product.id) ?? [];
        return {
          ...product,
          stocks: productStocks,
          totalStock: productStocks.reduce((sum, s) => sum + s.stock, 0),
        };
      });
    },
    enabled: options?.enabled ?? true,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      (error as Error)?.message ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetProductStock;
