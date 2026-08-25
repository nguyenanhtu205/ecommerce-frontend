import AssetImage from '../product/AssetImage';
import type { GetShopGroupedCartResponse } from '@/hooks';
import { Link } from 'react-router-dom';

type CartItemData = GetShopGroupedCartResponse[number]['items'][number];

type CartItemRowProps = {
  item: CartItemData;
  assetMap: Record<string, string>;
  isLoadingAssets: boolean;
  onToggleSelect: (combinationId: string) => void;
  onQuantityChange: (combinationId: string, quantity: number) => void;
  onRemove: (combinationId: string) => void;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

export default function CartItemRow({
  item,
  assetMap,
  isLoadingAssets,
  onToggleSelect,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  // BE chưa trả stockAvailable nên tạm không giới hạn max, chỉ giữ min 1
  const clamp = (value: number) => Math.max(value, 1);
  const totalAmount = item.priceSnapshot * item.quantity;

  return (
    <div className='grid grid-cols-[auto_1fr_140px_140px_120px_140px] items-center gap-4 bg-white px-6 py-4'>
      <input
        type='checkbox'
        checked={item.isSelected}
        onChange={() => onToggleSelect(item.combinationId)}
        className='h-4 w-4 accent-[#EE4D2D]'
      />

      <div className='flex items-center gap-3'>
        <AssetImage
          assetId={item.thumbnailUrl}
          assetMap={assetMap}
          isLoading={isLoadingAssets}
          alt={item.productName}
          className='h-16 w-16 shrink-0 border border-slate-100 object-cover'
        />
        <div className='min-w-0'>
          <Link
            to={`/products/${item.productId}`}
            className='cursor-pointer hover:text-[#EE4D2D] hover:underline'
          >
            <p className='line-clamp-2 text-sm text-slate-800 hover:text-[#EE4D2D]'>
              {item.productName}
            </p>
          </Link>
          {item.variation && (
            <button className='mt-1 flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-700'>
              Phân Loại Hàng: {item.variation}
              <svg
                width='10'
                height='10'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <path d='m6 9 6 6 6-6' />
              </svg>
            </button>
          )}
        </div>
      </div>

      <span className='text-right text-sm text-slate-700'>{formatPrice(item.priceSnapshot)}</span>

      <div className='flex flex-col items-center gap-1'>
        <div className='flex items-center border border-slate-300'>
          <button
            type='button'
            onClick={() => onQuantityChange(item.combinationId, clamp(item.quantity - 1))}
            className='flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50'
          >
            −
          </button>
          <input
            type='text'
            value={item.quantity}
            onChange={(e) => {
              const num = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
              onQuantityChange(item.combinationId, clamp(Number.isNaN(num) ? 1 : num));
            }}
            className='h-8 w-10 border-x border-slate-300 text-center text-sm outline-none'
          />
          <button
            type='button'
            onClick={() => onQuantityChange(item.combinationId, clamp(item.quantity + 1))}
            className='flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50'
          >
            +
          </button>
        </div>
        {/* Giới hạn tồn kho - BE chưa trả stockAvailable, chờ bổ sung */}
        {/* <span className='text-xs text-[#EE4D2D]'>Còn {item.stockAvailable} sản phẩm</span> */}
      </div>

      <span className='text-right text-sm font-medium text-[#EE4D2D]'>
        {formatPrice(totalAmount)}
      </span>

      <div className='flex flex-col items-center gap-1 text-sm'>
        <button
          onClick={() => onRemove(item.combinationId)}
          className='cursor-pointer text-black hover:text-[#EE4D2D]'
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
