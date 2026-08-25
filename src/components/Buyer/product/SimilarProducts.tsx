import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { type Product } from '@/types';
import { useGetSimilarProducts, useProductThumbnails } from '@/hooks';
import { type GetSimilarProductsItem } from '@/hooks';

type SimilarProductsProps = {
  productId: string;
  categorySlug: string;
};

function toProductCardData(item: GetSimilarProductsItem): Product {
  return {
    productId: item.id,
    shopId: '',
    shopName: '',
    name: item.name,
    description: '',
    brand: null,
    tags: [],
    searchableSpecs: '',
    thumbnailUrl: item.thumbnailUrl,
    location: item.location,
    categoryPath: [],
    priceMin: String(item.priceMin),
    priceMax: String(item.priceMax),
    originalPriceMin: item.originalPriceMin != null ? String(item.originalPriceMin) : null,
    discountPercent: item.discountPercent,
    stockTotal: item.stockTotal,
    isOutOfStock: item.isOutOfStock,
    ratingAverage: item.ratingAverage,
    ratingCount: item.ratingCount,
    soldCount: item.soldCount,
    syncedAt: '',
  };
}

export default function SimilarProducts({ productId, categorySlug }: SimilarProductsProps) {
  const { data, isPending } = useGetSimilarProducts({ productId });
  const items = data ?? [];
  const products = items.map(toProductCardData);

  const thumbnailMap = useProductThumbnails(products.map((p) => p.thumbnailUrl));

  if (isPending) {
    return (
      <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
        <div className='h-4 w-56 animate-pulse rounded bg-slate-200' />
        <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-56 w-full animate-pulse rounded-sm bg-slate-100' />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-sm font-medium tracking-wide text-slate-800'>
        CÓ THỂ BẠN CŨNG THÍCH
      </h2>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            thumbnail={thumbnailMap.get(product.thumbnailUrl) ?? { status: 'loading' }}
          />
        ))}
      </div>

      <div className='mt-6 flex justify-center'>
        <Link
          to={`/${categorySlug}`}
          className='rounded-sm border border-slate-300 bg-white px-10 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-400'
        >
          Xem Thêm
        </Link>
      </div>
    </div>
  );
}
