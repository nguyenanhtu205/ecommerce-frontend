import { useState } from 'react';
import { type CheckoutShippingMethod } from '@/types';

export const CARRIER_LABEL: Record<string, string> = {
  mock: 'Giao hàng thử nghiệm',
  ghn: 'Giao hàng nhanh',
  ghtk: 'Giao hàng tiết kiệm',
};

type ShippingMethodSelectorProps = {
  method: CheckoutShippingMethod;
  carrierOptions: string[];
  isPending: boolean;
  onChange: (carrierCode: string) => void;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function formatDeliveryDate(dateString: string | null) {
  if (!dateString) {
    return;
  }

  const date = new Date(dateString);
  return `${date.getDate()} Thg ${date.getMonth() + 1}`;
}

export default function ShippingMethodSelector({
  method,
  carrierOptions,
  isPending,
  onChange,
}: ShippingMethodSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  if (isPending) {
    return (
      <div className='divide-y divide-slate-100'>
        <div className='space-y-2 py-4'>
          <div className='h-4 w-48 animate-pulse rounded bg-slate-200' />
          <div className='h-6 w-40 animate-pulse rounded bg-slate-200' />
          <div className='h-3 w-56 animate-pulse rounded bg-slate-200' />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='divide-y divide-slate-100'>
        <div className='flex items-start justify-between py-4'>
          <div>
            <p className='text-sm text-slate-500'>
              Phương thức vận chuyển:{' '}
              <span className='font-medium text-slate-800'>{method.carrierName}</span>
            </p>

            {method.isValid ? (
              <p className='mt-2 flex items-center gap-2 text-sm text-slate-600'>
                Nhận trong{' '}
                <span className='flex items-center gap-1 bg-emerald-50 px-2 py-0.5 text-emerald-700'>
                  <svg
                    width='12'
                    height='12'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M3 7h11v8H3z' />
                    <path d='M14 10h4l3 3v2h-7z' />
                    <circle cx='7' cy='18' r='1.6' />
                    <circle cx='18' cy='18' r='1.6' />
                  </svg>
                </span>
                <span className='text-black'>
                  {formatDeliveryDate(method.estimatedDeliveryStart)} -{' '}
                  {formatDeliveryDate(method.estimatedDeliveryEnd)}
                </span>
              </p>
            ) : (
              <p className='mt-2 text-sm text-red-500'>
                {method.failureReason ?? 'Không thể tính phí vận chuyển cho đơn vị này.'}
              </p>
            )}
          </div>
          <div className='text-right'>
            <button
              type='button'
              onClick={() => setShowModal(true)}
              disabled={carrierOptions.length <= 1}
              className='cursor-pointer text-sm text-sky-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline'
            >
              Thay Đổi
            </button>
            {method.isValid && (
              <p className='mt-2 text-sm text-slate-700'>{formatPrice(method.fee)}</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          onClick={() => setShowModal(false)}
        >
          <div className='w-full max-w-sm bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className='border-b border-slate-100 px-6 py-5'>
              <h3 className='text-base font-medium text-slate-800'>Chọn phương thức vận chuyển</h3>
            </div>

            <div className='divide-y divide-slate-100'>
              {carrierOptions.map((carrierCode) => (
                <button
                  key={carrierCode}
                  type='button'
                  onClick={() => {
                    onChange(carrierCode);
                    setShowModal(false);
                  }}
                  className='flex w-full cursor-pointer items-center gap-3 px-6 py-4 text-left hover:bg-slate-50'
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      method.carrierCode === carrierCode ? 'border-[#EE4D2D]' : 'border-slate-300'
                    }`}
                  >
                    {method.carrierCode === carrierCode && (
                      <span className='h-2.5 w-2.5 rounded-full bg-[#EE4D2D]' />
                    )}
                  </span>
                  <span className='text-sm text-slate-700'>
                    {CARRIER_LABEL[carrierCode] ?? carrierCode}
                  </span>
                </button>
              ))}
            </div>

            <div className='flex justify-end border-t border-slate-100 px-6 py-4'>
              <button
                type='button'
                onClick={() => setShowModal(false)}
                className='h-10 cursor-pointer px-6 text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-800'
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
