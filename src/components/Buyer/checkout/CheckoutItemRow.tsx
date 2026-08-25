import { type OrderItem } from '@/types';

type CheckoutItemRowProps = {
  item: OrderItem;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

export default function CheckoutItemRow({ item }: CheckoutItemRowProps) {
  return (
    <div className='grid grid-cols-[1fr_140px_100px_140px] items-center gap-4 py-4'>
      <div className='flex items-center gap-3'>
        <img
          src={item.thumbnail}
          alt={item.productName}
          className='h-16 w-16 shrink-0 border border-slate-100 object-cover'
        />
        <div className='min-w-0'>
          <p className='line-clamp-2 text-sm text-slate-800'>{item.productName}</p>
          {item.variation && <p className='mt-1 text-xs text-slate-400'>Loại: {item.variation}</p>}
        </div>
      </div>

      <div className='text-right'>
        <span className='text-sm text-slate-700'>{formatPrice(item.price)}</span>
        {item.originalPrice && (
          <p className='text-xs text-slate-400 line-through'>{formatPrice(item.originalPrice)}</p>
        )}
      </div>

      <span className='text-center text-sm text-slate-700'>{item.quantity}</span>

      <span className='text-right text-sm text-slate-800'>
        {formatPrice(item.price * item.quantity)}
      </span>
    </div>
  );
}
