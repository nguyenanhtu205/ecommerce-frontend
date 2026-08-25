import { type ProductCardProps } from '@/types';
import { Link } from 'react-router-dom';

function formatPrice(value: string | number) {
  const num = typeof value === 'string' ? Number(value) : value;
  return num.toLocaleString('vi-VN') + '₫';
}

function ratingCountText(count: number) {
  return count > 999 ? `${(count / 1000).toFixed(1)}k` : count;
}

export default function ProductCard({ product, thumbnail }: ProductCardProps) {
  const {
    productId,
    name,
    location,
    priceMin,
    priceMax,
    originalPriceMin,
    discountPercent,
    soldCount,
    ratingAverage,
    ratingCount,
    stockTotal,
    isOutOfStock,
  } = product;

  const isPriceRange = priceMin !== priceMax;
  const isLowStock = !isOutOfStock && stockTotal > 0 && stockTotal <= 10;

  return (
    <Link
      to={`/product/${productId}`}
      className='group block overflow-hidden rounded-sm bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
    >
      {/* Thumbnail */}
      <div className='relative aspect-square bg-slate-100'>
        {thumbnail.status === 'loading' && (
          <div className='h-full w-full animate-pulse bg-slate-300' />
        )}

        {thumbnail.status === 'error' && (
          <div className='flex h-full items-center justify-center text-xs text-slate-400'>
            Ảnh sản phẩm
          </div>
        )}

        {thumbnail.status === 'ready' && (
          <img
            src={thumbnail.url}
            alt={name || 'Ảnh sản phẩm'}
            width={120}
            height={120}
            className='h-full w-full object-cover'
          />
        )}

        {discountPercent && (
          <span className='absolute top-1.5 right-1.5 rounded-sm bg-[#FFEEE8] px-1 py-0.5 text-[10px] font-bold text-[#EE4D2D]'>
            -{discountPercent}%
          </span>
        )}

        {isOutOfStock && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
            <span className='rounded-sm bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-700'>
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className='space-y-1 p-2'>
        <p className='line-clamp-2 text-xs text-black' title={name}>
          {name}
        </p>
        <div className='flex items-center gap-1 text-[11px] text-amber-500'>
          <svg width='11' height='11' viewBox='0 0 24 24' fill='currentColor'>
            <path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z' />
          </svg>
          {ratingAverage.toFixed(1)}
          <span className='text-slate-400'>({ratingCountText(ratingCount)})</span>
        </div>
        <div className='flex items-baseline gap-1.5'>
          <span className='text-sm text-[#EE4D2D]'>
            {isPriceRange
              ? `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`
              : formatPrice(priceMin)}
          </span>
          {originalPriceMin && (
            <span className='text-[11px] text-slate-400 line-through'>
              {formatPrice(originalPriceMin)}
            </span>
          )}
        </div>

        {isLowStock && (
          <p className='text-right text-[11px] font-medium text-red-500'>
            Chỉ còn {stockTotal} sản phẩm
          </p>
        )}
        <div className='flex items-center justify-between text-[11px] text-slate-400'>
          <span>Đã bán {soldCount}</span>
          <span>{location}</span>
        </div>
      </div>
    </Link>
  );
}
