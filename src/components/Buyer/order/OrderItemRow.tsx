import { type OrderItem } from '@/types';
import { Link } from 'react-router-dom';

type OrderItemRowProps = {
  item: OrderItem;
  imageUrl?: string;
  isImageLoading?: boolean;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

export default function OrderItemRow({ item, imageUrl, isImageLoading }: OrderItemRowProps) {
  return (
    <div className='flex items-center gap-3 py-3'>
      {isImageLoading ? (
        <div className='h-16 w-16 shrink-0 animate-pulse border border-slate-100 bg-slate-200' />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={item.productName}
          className='h-16 w-16 shrink-0 border border-slate-100 object-cover'
        />
      ) : (
        <div className='flex h-16 w-16 shrink-0 items-center justify-center border border-slate-100 bg-slate-50 text-[10px] text-slate-300'>
          Không có ảnh
        </div>
      )}

      <div className='min-w-0 flex-1'>
        <Link
          to={`/product/${item.productId}`}
          className='cursor-pointer truncate text-sm text-slate-800 hover:text-slate-600'
        >
          {item.productName}
        </Link>
        {item.variation && (
          <p className='mt-1 text-xs text-slate-400'>Phân loại hàng: {item.variation}</p>
        )}
        <p className='mt-1 text-xs text-slate-400'>x{item.quantity}</p>
      </div>
      <div className='shrink-0 text-right'>
        {item.originalPrice && (
          <span className='mr-2 text-xs text-slate-400 line-through'>
            {formatPrice(item.originalPrice)}
          </span>
        )}
        <span className='text-sm text-slate-700'>{formatPrice(item.price)}</span>
      </div>
    </div>
  );
}
