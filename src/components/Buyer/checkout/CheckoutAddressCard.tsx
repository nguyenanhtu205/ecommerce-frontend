import { type Address } from '@/types';

type CheckoutAddressCardProps = {
  address: Address;
  onChange: () => void;
};

export default function CheckoutAddressCard({ address, onChange }: CheckoutAddressCardProps) {
  return (
    <div className='bg-white p-6 shadow-sm'>
      <p className='flex items-center gap-1.5 text-sm font-medium text-[#EE4D2D]'>
        <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z' />
        </svg>
        Địa Chỉ Nhận Hàng
      </p>

      <div className='mt-3 flex flex-wrap items-center gap-3'>
        <span className='font-medium text-slate-800'>
          {address.fullName} ({address.phone})
        </span>
        <span className='text-slate-600'>{address.fullAddressText}</span>
        {address.isDefault && (
          <span className='border border-[#EE4D2D] px-1.5 py-0.5 text-xs text-[#EE4D2D]'>
            Mặc định
          </span>
        )}
        <button
          type='button'
          onClick={onChange}
          className='ml-auto cursor-pointer text-sm text-sky-600 hover:underline'
        >
          Thay Đổi
        </button>
      </div>
    </div>
  );
}
