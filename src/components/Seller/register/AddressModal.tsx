import { useEffect, useMemo, useState } from 'react';
import type { Address, AddressType } from '@/types';
import { useCreateAddress, useUpdateAddress } from '@/hooks';

const LOCATION_OPTIONS = [
  'Thành phố Hà Nội/Phường Ba Đình',
  'Thành phố Hà Nội/Phường Hoàn Kiếm',
  'Thành phố Hà Nội/Phường Hai Bà Trưng',
  'Thành phố Hà Nội/Phường Đống Đa',
  'Thành phố Hà Nội/Phường Cầu Giấy',
  'Thành phố Hà Nội/Phường Thanh Xuân',
  'Thành phố Hà Nội/Phường Tây Hồ',
  'Thành phố Hà Nội/Phường Hoàng Mai',
  'Thành phố Hà Nội/Phường Long Biên',
  'Thành phố Hà Nội/Phường Hà Đông',
  'Thành phố Hà Nội/Phường Bắc Từ Liêm',
  'Thành phố Hà Nội/Phường Nam Từ Liêm',

  'Thành phố Hồ Chí Minh/Phường Bến Nghé',
  'Thành phố Hồ Chí Minh/Phường Bến Thành',
  'Thành phố Hồ Chí Minh/Phường Sài Gòn',
  'Thành phố Hồ Chí Minh/Phường Tân Định',
  'Thành phố Hồ Chí Minh/Phường Cầu Ông Lãnh',
  'Thành phố Hồ Chí Minh/Phường Cầu Kho',
  'Thành phố Hồ Chí Minh/Phường Chợ Quán',
  'Thành phố Hồ Chí Minh/Phường Bình Thạnh',
  'Thành phố Hồ Chí Minh/Phường Gia Định',
  'Thành phố Hồ Chí Minh/Phường Thủ Đức',
  'Thành phố Hồ Chí Minh/Phường Phú Nhuận',
  'Thành phố Hồ Chí Minh/Phường Tân Sơn Hòa',

  'Thành phố Đà Nẵng/Phường Hải Châu',
  'Thành phố Đà Nẵng/Phường Thanh Khê',
  'Thành phố Đà Nẵng/Phường An Hải',
  'Thành phố Đà Nẵng/Phường Sơn Trà',
  'Thành phố Đà Nẵng/Phường Ngũ Hành Sơn',
  'Thành phố Đà Nẵng/Phường Liên Chiểu',
  'Thành phố Đà Nẵng/Phường Cẩm Lệ',
  'Thành phố Đà Nẵng/Phường Hòa Xuân',
];

const ADDRESS_TYPE_TO_NUMBER: Record<AddressType, 0 | 1> = {
  home: 0,
  office: 1,
};

type AddressModalProps = {
  open: boolean;
  initialAddress?: Address | null;
  onClose: () => void;
  onSave: (address: Address) => void;
  isDefault: boolean;
  isPickUpAddress: boolean;
};

export default function AddressModal({
  open,
  initialAddress,
  onClose,
  onSave,
  isDefault,
  isPickUpAddress,
}: AddressModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [addressDetail, setAddressDetail] = useState('');
  const [addressType, setAddressType] = useState<AddressType>('home');

  const isEditing = Boolean(initialAddress);

  const {
    createAddress,
    isPending: isCreating,
    errorMessage: createErrorMessage,
  } = useCreateAddress();
  const {
    updateAddress,
    isPending: isUpdating,
    errorMessage: updateErrorMessage,
  } = useUpdateAddress();

  const isPending = isEditing ? isUpdating : isCreating;
  const errorMessage = isEditing ? updateErrorMessage : createErrorMessage;

  useEffect(() => {
    if (!open) return;
    if (initialAddress) {
      setFullName(initialAddress.fullName);
      setPhone(initialAddress.phone);
      setLocation(`${initialAddress.province}/${initialAddress.ward}`);
      setAddressDetail(initialAddress.addressDetail);
      setAddressType(initialAddress.addressType);
    } else {
      setFullName('');
      setPhone('');
      setLocation(LOCATION_OPTIONS[0]);
      setAddressDetail('');
      setAddressType('home');
    }
  }, [open, initialAddress]);

  const [province, ward] = location.split('/');

  const isFormValid = useMemo(
    () => fullName.trim() !== '' && phone.trim() !== '' && addressDetail.trim() !== '',
    [fullName, phone, addressDetail],
  );

  const hasChanges = useMemo(() => {
    if (!isEditing || !initialAddress) return false;
    return (
      fullName !== initialAddress.fullName ||
      phone !== initialAddress.phone ||
      province !== initialAddress.province ||
      ward !== initialAddress.ward ||
      addressDetail !== initialAddress.addressDetail ||
      addressType !== initialAddress.addressType
    );
  }, [isEditing, initialAddress, fullName, phone, province, ward, addressDetail, addressType]);

  const isSaveDisabled = isPending || (isEditing ? !hasChanges : !isFormValid);

  if (!open) return null;

  const handleSave = () => {
    if (isSaveDisabled) return;

    const fullAddressText = `${addressDetail}, ${ward}, ${province}`;

    if (isEditing && initialAddress) {
      const provinceChanged = province !== initialAddress.province;
      const wardChanged = ward !== initialAddress.ward;
      const addressDetailChanged = addressDetail !== initialAddress.addressDetail;
      const locationChanged = provinceChanged || wardChanged || addressDetailChanged;

      updateAddress(
        {
          id: initialAddress.id,
          fullName: fullName !== initialAddress.fullName ? fullName : null,
          phone: phone !== initialAddress.phone ? phone : null,
          province: provinceChanged ? province : null,
          ward: wardChanged ? ward : null,
          addressDetail: addressDetailChanged ? addressDetail : null,
          fullAddressText: locationChanged ? fullAddressText : null,
          latitude: null,
          longitude: null,
          addressType: ADDRESS_TYPE_TO_NUMBER[addressType],
        },
        {
          onSuccess: () => {
            onSave({
              id: initialAddress.id,
              fullName,
              phone,
              province,
              ward,
              addressDetail,
              fullAddressText,
              addressType,
              latitude: initialAddress.latitude,
              longitude: initialAddress.longitude,
              isDefault: initialAddress.isDefault,
              isPickupAddress: initialAddress.isPickupAddress,
            });
          },
        },
      );
      return;
    }

    createAddress(
      {
        fullName,
        phone,
        province,
        ward,
        addressDetail,
        fullAddressText,
        addressType: ADDRESS_TYPE_TO_NUMBER[addressType],
        isDefault,
        isPickUpAddress,
      },
      {
        onSuccess: (data) => {
          onSave({
            id: data.addressId,
            fullName: data.fullName,
            phone: data.phone,
            province: data.province,
            ward: data.ward,
            addressDetail: data.addressDetail,
            fullAddressText: data.fullAddressText,
            addressType,
            latitude: data.latitude ?? undefined,
            longitude: data.longitude ?? undefined,
            isDefault: true,
            isPickupAddress: true,
          });
        },
      },
    );
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onClose}
    >
      <div className='w-full max-w-125 bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
        <div className='border-b border-slate-100 px-6 py-5'>
          <h2 className='text-[18px] font-medium text-slate-800'>
            {initialAddress ? 'Cập Nhật Địa Chỉ' : 'Địa chỉ mới'}
          </h2>
        </div>

        <div className='space-y-4 p-6'>
          <div className='flex gap-3'>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='Họ và tên'
              disabled={isPending}
              className='h-10 flex-1 border border-slate-300 px-3 text-sm transition outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Số điện thoại'
              disabled={isPending}
              className='h-10 flex-1 border border-slate-300 px-3 text-sm transition outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
            />
          </div>

          <div className='relative'>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isPending}
              className='h-10 w-full appearance-none rounded-sm border border-slate-300 px-3 pr-10 text-sm text-slate-700 outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
            >
              {LOCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <svg
              className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                clipRule='evenodd'
              />
            </svg>
          </div>

          <textarea
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            rows={2}
            placeholder='Địa chỉ cụ thể'
            disabled={isPending}
            className='w-full resize-none border border-slate-300 px-3 py-2 text-sm transition outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
          />

          <div>
            <p className='mb-2 text-sm text-slate-700'>Loại địa chỉ:</p>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setAddressType('home')}
                disabled={isPending}
                className={`h-10 border px-5 text-sm ${
                  addressType === 'home'
                    ? 'border-[#EE4D2D] text-[#EE4D2D]'
                    : 'border-slate-300 text-slate-600 hover:border-[#EE4D2D]'
                }`}
              >
                Nhà Riêng
              </button>
              <button
                type='button'
                onClick={() => setAddressType('office')}
                disabled={isPending}
                className={`h-10 border px-5 text-sm ${
                  addressType === 'office'
                    ? 'border-[#EE4D2D] text-[#EE4D2D]'
                    : 'border-slate-300 text-slate-600 hover:border-[#EE4D2D]'
                }`}
              >
                Văn Phòng
              </button>
            </div>
          </div>

          {errorMessage && <p className='text-xs text-red-500'>{errorMessage}</p>}

          <div className='flex justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={isPending}
              className='h-10 cursor-pointer px-6 text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-800'
            >
              Trở Lại
            </button>
            <button
              type='button'
              onClick={handleSave}
              disabled={isSaveDisabled}
              className='h-10 cursor-pointer bg-[#EE4D2D] px-8 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-[#EE4D2D]/40 disabled:hover:bg-[#EE4D2D]/40'
            >
              {isPending ? 'Đang lưu...' : 'Hoàn thành'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
