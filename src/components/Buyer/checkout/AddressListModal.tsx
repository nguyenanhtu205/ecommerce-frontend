import { type Address } from '@/types';

type AddressListModalProps = {
  addresses: Address[];
  selectedAddressId: string | undefined;
  onClose: () => void;
  onSelect: (address: Address) => void;
  onEdit: (address: Address) => void;
  onAddNew: () => void;
};

export default function AddressListModal({
  addresses,
  selectedAddressId,
  onClose,
  onSelect,
  onEdit,
  onAddNew,
}: AddressListModalProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
      <div className='flex max-h-[85vh] w-full max-w-lg flex-col bg-white'>
        <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
          <h3 className='text-base font-medium text-slate-800'>Địa Chỉ Của Tôi</h3>
          <button
            onClick={onClose}
            className='cursor-pointer text-slate-400 hover:text-[#EE4D2D]'
            title='Đóng'
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='m6 6 12 12M18 6 6 18' />
            </svg>
          </button>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {addresses.map((address) => (
            <div
              key={address.id}
              className='flex items-start gap-3 border-b border-slate-50 px-6 py-4'
            >
              <button
                type='button'
                onClick={() => onSelect(address)}
                className='mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-300'
                title='Chọn địa chỉ này'
              >
                {selectedAddressId === address.id && (
                  <span className='h-2.5 w-2.5 rounded-full bg-[#EE4D2D]' />
                )}
              </button>

              <div className='flex-1'>
                <p className='flex items-center gap-2 text-sm'>
                  <span className='font-medium text-slate-800'>{address.fullName}</span>
                  <span className='h-3 w-px bg-slate-300' />
                  <span className='text-slate-500'>{address.phone}</span>
                </p>
                <p className='mt-1 text-sm text-slate-500'>{address.addressDetail}</p>
                <p className='text-sm text-slate-500'>
                  {address.ward}, {address.province}
                </p>
                <div className='mt-2 flex gap-2'>
                  {address.isDefault && (
                    <span className='border border-[#EE4D2D] px-1.5 py-0.5 text-xs text-[#EE4D2D]'>
                      Mặc định
                    </span>
                  )}
                  {address.isPickupAddress && (
                    <span className='border border-slate-300 px-1.5 py-0.5 text-xs text-slate-500'>
                      Địa chỉ lấy hàng
                    </span>
                  )}
                </div>
              </div>

              <button
                type='button'
                onClick={() => onEdit(address)}
                className='shrink-0 cursor-pointer text-sm text-sky-600 hover:underline'
              >
                Cập nhật
              </button>
            </div>
          ))}
        </div>

        <div className='flex justify-end border-t border-slate-100 px-6 py-4'>
          <button
            type='button'
            onClick={onAddNew}
            className='flex cursor-pointer items-center gap-1.5 bg-[#EE4D2D] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d8431f]'
          >
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
            >
              <path d='M12 5v14M5 12h14' />
            </svg>
            Thêm Địa Chỉ Mới
          </button>
        </div>
      </div>
    </div>
  );
}
