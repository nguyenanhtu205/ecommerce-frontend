import { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { AddressModal } from '@/components';
import { type Address, type AddressType } from '@/types';
import { useGetAddresses, useSetDefaultAddress, useDeleteAddress } from '@/hooks';

const ADDRESS_TYPE_LABEL: Record<AddressType, string> = {
  home: 'Nhà Riêng',
  office: 'Văn Phòng',
};

const ADDRESS_TYPE_MAP: Record<number, AddressType> = {
  0: 'home',
  1: 'office',
};

export default function Address() {
  const { data, isPending, errorMessage } = useGetAddresses();
  const { setDefaultAddress } = useSetDefaultAddress();
  const {
    deleteAddress,
    isPending: isDeleting,
    errorMessage: deleteErrorMessage,
  } = useDeleteAddress();
  const [editingAddress, setEditingAddress] = useState<Address | null | undefined>(undefined);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  const addresses: Address[] = (data ?? [])
    .map((item) => ({
      id: item.id,
      fullName: item.fullName,
      phone: item.phone,
      province: item.province,
      ward: item.ward,
      addressDetail: item.addressDetail,
      fullAddressText: item.fullAddressText,
      addressType: ADDRESS_TYPE_MAP[item.addressType] ?? 'home',
      isDefault: item.isDefault,
    }))
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  const canAddAddress = !isPending && !errorMessage;
  const isDefault = canAddAddress && addresses.length === 0;

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
  };

  const handleConfirmDelete = () => {
    if (!deletingAddress) return;
    deleteAddress(deletingAddress.id, {
      onSuccess: () => {
        setDeletingAddress(null);
      },
    });
  };

  const willReassignDefault = Boolean(deletingAddress?.isDefault) && addresses.length > 1;

  return (
    <>
      <div className='bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-slate-100 px-5 py-5'>
          <h1 className='text-lg font-medium text-slate-800'>Địa chỉ của tôi</h1>

          <button
            onClick={() => setEditingAddress(null)}
            disabled={!canAddAddress}
            className='flex cursor-pointer items-center gap-2 bg-[#EE4D2D] px-4 py-2 text-sm text-white hover:bg-[#e24929] disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Plus size={16} />
            Thêm địa chỉ
          </button>
        </div>

        {isPending && (
          <div className='divide-y divide-slate-50'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className='flex items-start justify-between gap-4 px-5 py-5'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-5 w-32 animate-pulse rounded bg-slate-200' />
                    <div className='h-3 w-px bg-slate-200' />
                    <div className='h-4 w-24 animate-pulse rounded bg-slate-200' />
                  </div>

                  <div className='mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-slate-200' />

                  <div className='mt-1 h-4 w-56 max-w-full animate-pulse rounded bg-slate-200' />

                  <div className='mt-2 flex gap-2'>
                    <div className='h-5 w-20 animate-pulse rounded bg-slate-200' />
                    <div className='h-5 w-16 animate-pulse rounded bg-slate-200' />
                  </div>
                </div>

                <div className='flex shrink-0 flex-col items-end gap-2'>
                  <div className='flex gap-3'>
                    <div className='h-5 w-16 animate-pulse rounded bg-slate-200' />
                    <div className='h-5 w-8 animate-pulse rounded bg-slate-200' />
                  </div>

                  <div className='h-7 w-32 animate-pulse rounded bg-slate-200' />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isPending && errorMessage && (
          <div className='flex h-125 flex-col items-center justify-center'>
            <p className='text-sm text-red-500'>{errorMessage}</p>
          </div>
        )}

        {!isPending && !errorMessage && addresses.length === 0 && (
          <div className='flex h-125 flex-col items-center justify-center'>
            <MapPin size={72} strokeWidth={1.2} className='text-slate-300' />
            <p className='mt-5 text-lg text-slate-600'>Bạn chưa có địa chỉ.</p>
          </div>
        )}

        {!isPending && !errorMessage && addresses.length > 0 && (
          <div className='divide-y divide-slate-50'>
            {addresses.map((address) => (
              <div key={address.id} className='flex items-start justify-between gap-4 px-5 py-5'>
                <div>
                  <p className='flex items-center gap-2 text-sm'>
                    <span className='text-base text-black'>{address.fullName}</span>
                    <span className='h-3 w-px bg-slate-300' />
                    <span className='text-slate-500'>{address.phone}</span>
                  </p>
                  <p className='mt-1 text-sm text-slate-500'>{address.addressDetail}</p>
                  <p className='text-sm text-slate-500'>
                    {address.ward}, {address.province}
                  </p>
                  <div className='mt-2 flex gap-2'>
                    <span className='border border-slate-300 px-1.5 py-0.5 text-xs text-slate-500'>
                      {ADDRESS_TYPE_LABEL[address.addressType]}
                    </span>
                    {address.isDefault && (
                      <span className='border border-[#EE4D2D] px-1.5 py-0.5 text-xs text-[#EE4D2D]'>
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex shrink-0 flex-col items-end gap-2 text-sm'>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => setEditingAddress(address)}
                      className='cursor-pointer text-sky-600 hover:underline'
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={() => setDeletingAddress(address)}
                      className='cursor-pointer text-sky-600 hover:underline'
                    >
                      Xoá
                    </button>
                  </div>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className='cursor-pointer border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-[#EE4D2D] hover:text-[#EE4D2D]'
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddressModal
        open={editingAddress !== undefined}
        initialAddress={editingAddress}
        onClose={() => setEditingAddress(undefined)}
        onSave={() => setEditingAddress(undefined)}
        isDefault={isDefault}
        isPickUpAddress={false}
      />

      {deletingAddress && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          onClick={() => !isDeleting && setDeletingAddress(null)}
        >
          <div className='w-full max-w-sm bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className='px-6 py-5'>
              <h3 className='text-base font-medium text-slate-800'>Xoá địa chỉ</h3>
              <p className='mt-3 text-sm text-slate-600'>Bạn có chắc chắn muốn xoá địa chỉ này?</p>
              {willReassignDefault && (
                <p className='mt-2 text-sm text-slate-600'>
                  Địa chỉ mặc định sẽ được gán cho địa chỉ mới nhất của bạn.
                </p>
              )}
              {deleteErrorMessage && (
                <p className='mt-2 text-xs text-red-500'>{deleteErrorMessage}</p>
              )}
            </div>
            <div className='flex justify-end gap-3 border-t border-slate-100 px-6 py-4'>
              <button
                type='button'
                onClick={() => setDeletingAddress(null)}
                disabled={isDeleting}
                className='h-10 cursor-pointer px-6 text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
              >
                Huỷ
              </button>
              <button
                type='button'
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className='h-10 cursor-pointer bg-[#EE4D2D] px-8 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-[#EE4D2D]/40'
              >
                {isDeleting ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
