import type { PaymentMethod, CheckoutSummary } from '@/types';
import { Link } from 'react-router-dom';

type PaymentMethodSectionProps = {
  paymentMethod: PaymentMethod;
  summary: CheckoutSummary;
  onChangeMethod: () => void;
  onPlaceOrder: () => void;
  disabled?: boolean;
  disabledMessage?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

export default function PaymentMethodSection({
  paymentMethod,
  summary,
  onChangeMethod,
  onPlaceOrder,
  disabled = false,
  disabledMessage,
  isSubmitting = false,
  errorMessage = null,
}: PaymentMethodSectionProps) {
  return (
    <div className='mt-3 bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b border-slate-100 px-6 py-4'>
        <span className='text-sm text-slate-800'>Phương thức thanh toán</span>
        <span className='flex items-center gap-3'>
          <span className='text-sm text-slate-700'>{paymentMethod.label}</span>
          <button
            onClick={onChangeMethod}
            className='cursor-pointer text-sm text-sky-600 hover:underline'
          >
            Thay đổi
          </button>
        </span>
      </div>

      <div className='space-y-2 bg-[#FFF9F6] px-6 py-5'>
        <div className='flex justify-end gap-16 text-sm'>
          <span className='text-slate-500'>Tổng tiền hàng</span>
          <span className='w-28 text-right text-slate-700'>
            {formatPrice(summary.merchandiseSubtotal)}
          </span>
        </div>
        <div className='flex justify-end gap-16 text-sm'>
          <span className='text-slate-500'>Tổng tiền phí vận chuyển</span>
          <span className='w-28 text-right text-slate-700'>
            {formatPrice(summary.shippingFeeSubtotal)}
          </span>
        </div>
        {summary.voucherDiscount > 0 && (
          <div className='flex justify-end gap-16 text-sm'>
            <span className='text-slate-500'>Giảm giá voucher</span>
            <span className='w-28 text-right text-slate-700'>
              -{formatPrice(summary.voucherDiscount)}
            </span>
          </div>
        )}
        <div className='flex justify-end gap-16 text-sm'>
          <span className='text-slate-500'>Tổng thanh toán</span>
          <span className='w-28 text-right text-xl font-medium text-[#EE4D2D]'>
            {formatPrice(summary.totalPayment)}
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between px-6 py-4'>
        <div className='flex-1'>
          <p className='text-xs whitespace-nowrap text-slate-400'>
            Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo{' '}
            <Link to='#' className='text-sky-600 hover:underline'>
              Điều khoản Shopee
            </Link>
          </p>

          {disabled && disabledMessage && (
            <p className='mt-1 text-xs text-red-500'>{disabledMessage}</p>
          )}
          {!disabled && errorMessage && (
            <p className='mt-1 text-xs font-medium text-red-500'>{errorMessage}</p>
          )}
        </div>
        <button
          onClick={onPlaceOrder}
          disabled={disabled}
          className='flex shrink-0 cursor-pointer items-center gap-2 bg-[#EE4D2D] px-10 py-2.5 text-sm font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:bg-[#EE4D2D]/40 disabled:hover:bg-[#EE4D2D]/40'
        >
          {isSubmitting && (
            <svg
              className='h-4 w-4 animate-spin'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
              />
            </svg>
          )}
          {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
        </button>
      </div>
    </div>
  );
}
