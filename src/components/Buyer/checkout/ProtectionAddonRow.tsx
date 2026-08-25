import { type ProductProtectionAddon } from '@/types';
import { Link } from 'react-router-dom';

type ProtectionAddonRowProps = {
  addon: ProductProtectionAddon;
  onToggle: (id: number) => void;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

export default function ProtectionAddonRow({ addon, onToggle }: ProtectionAddonRowProps) {
  return (
    <div className='grid grid-cols-[1fr_140px_100px_140px] items-start gap-4 border-t border-slate-100 py-4'>
      <div className='flex items-start gap-3'>
        <input
          type='checkbox'
          checked={addon.isSelected}
          onChange={() => onToggle(addon.id)}
          className='mt-0.5 h-4 w-4 shrink-0 accent-[#EE4D2D]'
        />
        <div>
          <span className='flex items-center gap-1.5 text-sm text-slate-800'>
            {addon.label}
            {addon.badge && (
              <span className='bg-[#EE4D2D] px-1.5 py-0.5 text-[10px] font-bold text-white'>
                {addon.badge}
              </span>
            )}
          </span>
          <p className='mt-1 max-w-md text-xs text-slate-400'>
            {addon.description}{' '}
            <Link to='#' className='text-sky-600 hover:underline'>
              Tìm hiểu thêm
            </Link>
          </p>
        </div>
      </div>
      <span className='text-right text-sm text-slate-700'>{formatPrice(addon.price)}</span>
      <span className='text-center text-sm text-slate-700'>1</span>
      <span className='text-right text-sm text-slate-800'>
        {formatPrice(addon.isSelected ? addon.price : 0)}
      </span>
    </div>
  );
}
