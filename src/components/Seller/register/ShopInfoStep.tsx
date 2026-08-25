import { useState, type ReactNode } from 'react';
import type { ShopBasicInfo, Address } from '@/types';
import { useCreateShop } from '@/hooks';
import { useAuthStore } from '@/stores';
import AddressModal from './AddressModal';

type ShopInfoStepProps = {
  initialInfo: ShopBasicInfo;
  onSave: (info: ShopBasicInfo, address: Address | null) => void;
  onNext: (info: ShopBasicInfo, address: Address | null, shopId: string) => void;
};

const SHOP_NAME_MAX_LENGTH = 30;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ShopInfoStep({ initialInfo, onSave, onNext }: ShopInfoStepProps) {
  const [shopName, setShopName] = useState(initialInfo.shopName);
  const [email, setEmail] = useState(initialInfo.email);
  const [address, setAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const userId = useAuthStore((state) => state.user?.id);
  const { createShop, isPending, errorMessage } = useCreateShop();

  const buildInfo = (): ShopBasicInfo => ({
    ...initialInfo,
    shopName,
    email,
    pickupAddressId: address?.id ?? null,
  });

  const isShopNameValid = shopName.trim().length > 0;
  const isEmailValid = email.trim().length > 0 && EMAIL_REGEX.test(email.trim());
  const isAddressValid = address !== null;

  const isFormValid = isShopNameValid && isEmailValid && isAddressValid;

  const handleNext = () => {
    if (!isFormValid || isPending || !address || !userId) return;

    const info = buildInfo();

    createShop(
      {
        name: shopName.trim(),
        email: email.trim(),
        pickupAddressId: address.id,
        pickupAddressSnapshot: {
          userId,
          fullName: address.fullName,
          phone: address.phone,
          province: address.province,
          ward: address.ward,
          addressDetail: address.addressDetail,
          fullAddressText: address.fullAddressText,
          latitude: address.latitude ?? null,
          longitude: address.longitude ?? null,
          addressType: address.addressType,
        },
      },
      {
        onSuccess: (data) => {
          onNext(info, address, data.shopId);
        },
      },
    );
  };

  return (
    <div className='px-10 pb-10'>
      <div className='space-y-6 border-t border-slate-100 pt-6'>
        <FormRow label='Tên Shop' required>
          <div className='relative max-w-md'>
            <input
              value={shopName}
              maxLength={SHOP_NAME_MAX_LENGTH}
              onChange={(e) => setShopName(e.target.value)}
              disabled={isPending}
              className='w-full border border-slate-300 px-3 py-2 pr-14 text-sm outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
            />
            <span className='absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400'>
              {shopName.length}/{SHOP_NAME_MAX_LENGTH}
            </span>
          </div>
        </FormRow>

        <FormRow label='Địa chỉ lấy hàng' required>
          {address ? (
            <div className='flex max-w-md items-center justify-between border border-slate-300 px-3 py-2 text-sm text-slate-700'>
              <span className='truncate'>{address.fullAddressText}</span>
              <button
                type='button'
                onClick={() => setShowAddressModal(true)}
                disabled={isPending}
                className='ml-3 shrink-0 text-sky-600 hover:underline'
              >
                Sửa
              </button>
            </div>
          ) : (
            <button
              type='button'
              onClick={() => setShowAddressModal(true)}
              disabled={isPending}
              className='border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
            >
              + Thêm
            </button>
          )}
        </FormRow>

        <FormRow label='Email' required>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Nhập vào'
            disabled={isPending}
            className='w-full max-w-md border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#EE4D2D] disabled:bg-slate-50'
          />
        </FormRow>

        {/*<FormRow label='Số điện thoại' required>*/}
        {/*  <span className='text-sm text-slate-700'>{initialInfo.phone}</span>*/}
        {/*</FormRow>*/}
      </div>

      {errorMessage && <p className='mt-4 text-right text-xs text-red-500'>{errorMessage}</p>}

      <div className='mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6'>
        <button
          type='button'
          onClick={() => onSave(buildInfo(), address)}
          disabled={isPending}
          className='cursor-pointer border border-slate-300 px-6 py-2 text-sm text-slate-700 hover:bg-slate-50'
        >
          Lưu
        </button>
        <button
          type='button'
          disabled={!isFormValid || isPending}
          onClick={handleNext}
          className={`px-6 py-2 text-sm font-medium text-white transition-colors ${
            isFormValid && !isPending
              ? 'cursor-pointer bg-[#EE4D2D] hover:bg-[#d8431f]'
              : 'cursor-not-allowed bg-[#EE4D2D]/50'
          }`}
        >
          {isPending ? 'Đang xử lý...' : 'Tiếp theo'}
        </button>
      </div>

      <AddressModal
        open={showAddressModal}
        initialAddress={address}
        onClose={() => setShowAddressModal(false)}
        onSave={(addr) => {
          setAddress(addr);
          setShowAddressModal(false);
        }}
        isDefault={true}
        isPickUpAddress={true}
      />
    </div>
  );
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className='flex items-center gap-6'>
      <span className='w-36 shrink-0 text-right text-sm text-slate-700'>
        {required && <span className='mr-0.5 text-red-500'>*</span>}
        {label}
      </span>
      <div className='flex-1'>{children}</div>
    </div>
  );
}
