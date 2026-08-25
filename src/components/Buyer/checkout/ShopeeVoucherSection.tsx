import type { ShopeeVoucherSelection, ShopeeXuInfo } from '@/types';

type ShopeeVoucherSectionProps = {
  voucher: ShopeeVoucherSelection;
  xu: ShopeeXuInfo;
  onToggleXu: () => void;
};

export default function ShopeeVoucherSection({ xu, onToggleXu }: ShopeeVoucherSectionProps) {
  return (
    <div className='mt-3 bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
        <span className='flex items-center gap-2 text-sm text-slate-800'>
          <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            className='text-[#EE4D2D]'
          >
            <path d='M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z' />
          </svg>
          Shopee Voucher
        </span>
        <button className='cursor-pointer text-sm text-sky-600 hover:underline'>
          Chọn Voucher
        </button>
      </div>

      <div className='flex items-center justify-between px-6 py-4'>
        <span className='flex items-center gap-2 text-sm text-slate-800'>
          <span className='flex h-5 w-5 items-center justify-center rounded-full border border-amber-400 text-xs font-bold text-amber-500'>
            S
          </span>
          Shopee Xu
          {xu.disabledReason && <span className='text-slate-400'>{xu.disabledReason}</span>}
        </span>
        <span className='flex items-center gap-3'>
          <span className='text-sm text-slate-400'>[-0đ]</span>
          <input
            type='checkbox'
            checked={xu.isApplied}
            disabled={!xu.isUsable}
            onChange={onToggleXu}
            className='h-4 w-4 accent-[#EE4D2D] disabled:opacity-50'
          />
        </span>
      </div>
    </div>
  );
}
