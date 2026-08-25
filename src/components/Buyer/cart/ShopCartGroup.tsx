import type { GetShopGroupedCartResponse } from '@/hooks';
import CartItemRow from './CartItemRow';
import { IoIosChatbubbles } from 'react-icons/io';
import { Link } from 'react-router-dom';

type CartItemData = GetShopGroupedCartResponse[number]['items'][number];

type ShopCartGroupProps = {
  shopId: string;
  shopName: string;
  items: CartItemData[];
  assetMap: Record<string, string>;
  isLoadingAssets: boolean;
  onToggleShop: (shopId: string) => void;
  onToggleSelect: (combinationId: string) => void;
  onQuantityChange: (combinationId: string, quantity: number) => void;
  onRemove: (combinationId: string) => void;
};

export default function ShopCartGroup({
  shopId,
  shopName,
  items,
  assetMap,
  isLoadingAssets,
  onToggleShop,
  onToggleSelect,
  onQuantityChange,
  onRemove,
}: ShopCartGroupProps) {
  const allShopSelected = items.every((item) => item.isSelected);

  return (
    <div className='mt-3'>
      {/* Shop header */}
      <div className='flex items-center gap-3 bg-white px-6 py-3'>
        <input
          type='checkbox'
          checked={allShopSelected}
          onChange={() => onToggleShop(shopId)}
          className='h-4 w-4 accent-[#EE4D2D]'
        />
        <Link to={`/shop/${shopId}`} className='cursor-pointer'>
          <span className='text-sm text-black'>{shopName}</span>
        </Link>
        <IoIosChatbubbles className='cursor-pointer text-[#EE4D2D]' title='Nhắn với cửa hàng' />
      </div>
      <div className='mt-px space-y-px'>
        {items.map((item) => (
          <CartItemRow
            key={item.combinationId}
            item={item}
            assetMap={assetMap}
            isLoadingAssets={isLoadingAssets}
            onToggleSelect={onToggleSelect}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>
      <div className='mt-px flex items-center gap-2 bg-white px-6 py-3 text-sm'>
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.8'
          className='text-[#EE4D2D]'
        >
          <path d='M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z' />
        </svg>
        <Link to='#' className='text-blue-500 hover:underline'>
          Thêm Shop Voucher
        </Link>
      </div>
    </div>
  );
}
