import { type CheckoutShopGroup } from '@/types';
import CheckoutItemRow from './CheckoutItemRow';
import ProtectionAddonRow from './ProtectionAddonRow';
import ShippingMethodSelector from './ShippingMethodSelector';
import { IoIosChatbubbles } from 'react-icons/io';
import { useChatWindowStore } from '@/stores';

type CheckoutShopSectionProps = {
  shopId: string;
  group: CheckoutShopGroup;
  carrierOptions: string[];
  isShippingPending: boolean;
  onToggleAddon: (shopId: string, addonId: number) => void;
  onNoteChange: (shopId: string, note: string) => void;
  onChangeShippingMethod: (shopId: string, carrierCode: string) => void;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

export default function CheckoutShopSection({
  shopId,
  group,
  carrierOptions,
  isShippingPending,
  onToggleAddon,
  onNoteChange,
  onChangeShippingMethod,
}: CheckoutShopSectionProps) {
  const startConversationWithShop = useChatWindowStore((state) => state.startConversationWithShop);

  const merchandiseTotal = group.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addonTotal = group.protectionAddons
    .filter((a) => a.isSelected)
    .reduce((sum, a) => sum + a.price, 0);

  const shopTotal =
    merchandiseTotal + addonTotal + group.shippingMethod.fee - group.voucher.discountAmount;

  return (
    <div className='mt-3 bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-base font-medium text-slate-800'>Sản phẩm</h2>

      <div className='grid grid-cols-[1fr_140px_100px_140px] gap-4 border-b border-slate-100 pb-2 text-sm text-slate-400'>
        <span />
        <span className='text-right'>Đơn giá</span>
        <span className='text-center'>Số lượng</span>
        <span className='text-right'>Thành tiền</span>
      </div>

      <div className='flex items-center gap-2 pt-4'>
        {group.isFavorite && (
          <span className='bg-[#EE4D2D] px-1.5 py-0.5 text-[10px] font-bold text-white'>
            Yêu thích
          </span>
        )}
        <span className='text-sm font-medium text-slate-800'>{group.shopName}</span>
        <button
          onClick={() => startConversationWithShop(shopId)}
          className='flex cursor-pointer items-center gap-1 text-sm text-[#EE4D2D] hover:opacity-80'
        >
          <IoIosChatbubbles />
          Chat ngay
        </button>
      </div>

      <div className='divide-y divide-slate-100'>
        {group.items.map((item) => (
          <CheckoutItemRow key={item.id} item={item} />
        ))}
      </div>

      {group.protectionAddons.map((addon) => (
        <ProtectionAddonRow
          key={addon.id}
          addon={addon}
          onToggle={(id) => onToggleAddon(group.shopId, id)}
        />
      ))}

      <div className='flex items-center justify-between border-t border-slate-100 py-4'>
        <span className='flex items-center gap-2 text-sm text-slate-700'>
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
          Voucher của Shop
        </span>
        <button className='cursor-pointer text-sm text-sky-600 hover:underline'>
          Chọn Voucher
        </button>
      </div>

      <div className='grid grid-cols-1 gap-6 border-t border-slate-100 pt-4 md:grid-cols-2'>
        <div>
          <label className='mb-1.5 block text-sm text-slate-500'>Lời nhắn:</label>
          <input
            value={group.note}
            onChange={(e) => onNoteChange(group.shopId, e.target.value)}
            placeholder='Lưu ý cho Người bán...'
            className='w-full border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#EE4D2D]'
          />
        </div>
        <ShippingMethodSelector
          method={group.shippingMethod}
          carrierOptions={carrierOptions}
          isPending={isShippingPending}
          onChange={(carrierCode) => onChangeShippingMethod(shopId, carrierCode)}
        />
      </div>

      <div className='flex items-baseline justify-end border-t border-slate-100 pt-4 text-sm text-slate-700'>
        Tổng số tiền ({group.items.length} sản phẩm):&nbsp;
        <span className='ml-2 text-lg font-medium text-[#EE4D2D]'>{formatPrice(shopTotal)}</span>
      </div>
    </div>
  );
}
