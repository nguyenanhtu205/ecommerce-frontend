export type Product = {
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
  categoryPath: { id: string; name: string }[];
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
};

export type ThumbnailState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; url: string };

export type ProductCardProps = {
  product: Product;
  thumbnail: ThumbnailState;
};
