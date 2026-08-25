import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { type Product } from '@/types';
import { useGetProductViewsByShop, useProductThumbnails } from '@/hooks';
import type { GetProductViewsByShopItem } from '@/hooks';

type ShopOtherProductsProps = {
  shopId: string;
  productId: string;
};

function toProductCardData(item: GetProductViewsByShopItem, shopId: string): Product {
  return {
    productId: item.id,
    shopId,
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

export default function ShopOtherProducts({ shopId, productId }: ShopOtherProductsProps) {
  const { data, isPending } = useGetProductViewsByShop({ shopId, productId });
  const items = data?.items ?? [];
  const products = items.map((item) => toProductCardData(item, shopId));

  const thumbnailMap = useProductThumbnails(products.map((p) => p.thumbnailUrl));

  if (isPending) {
    return (
      <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
        <div className='h-4 w-56 animate-pulse rounded bg-slate-200' />
        <div className='mt-4 flex gap-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='h-56 w-40 shrink-0 animate-pulse rounded-sm bg-slate-100' />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-sm font-medium tracking-wide text-slate-800'>
          CÁC SẢN PHẨM KHÁC CỦA SHOP
        </h2>
        <Link
          to={`/shop/${shopId}`}
          className='flex items-center gap-1 text-sm text-[#EE4D2D] hover:opacity-80'
        >
          Xem Tất Cả
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
          >
            <path d='m9 18 6-6-6-6' />
          </svg>
        </Link>
      </div>

      <div className='flex gap-3 overflow-x-auto scroll-smooth pb-1'>
        {products.map((product) => (
          <div key={product.productId} className='w-40 shrink-0'>
            <ProductCard
              product={product}
              thumbnail={thumbnailMap.get(product.thumbnailUrl) ?? { status: 'loading' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
