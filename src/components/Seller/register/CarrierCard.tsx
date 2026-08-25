import { type ShippingCarrier } from '@/types';

type CarrierCardProps = {
  carrier: ShippingCarrier;
  onConnect: (carrierId: string) => void;
};

const STATUS_CONFIG: Record<ShippingCarrier['status'], { label: string; className: string }> = {
  not_connected: { label: '', className: '' },
  connecting: { label: 'Đang kết nối...', className: 'text-amber-500' },
  connected: { label: 'Đã kết nối', className: 'text-emerald-600' },
  failed: { label: 'Kết nối thất bại', className: 'text-red-500' },
};

export default function CarrierCard({ carrier, onConnect }: CarrierCardProps) {
  const statusInfo = STATUS_CONFIG[carrier.status];

  return (
    <div className='flex items-center justify-between border border-slate-200 px-5 py-4'>
      <div className='flex items-center gap-4'>
        <span className='flex h-11 w-11 items-center justify-center bg-slate-100 text-xs font-bold text-slate-500'>
          {carrier.logoText}
        </span>
        <div>
          <p className='text-sm font-medium text-slate-800'>{carrier.name}</p>
          {statusInfo.label && (
            <p className={`mt-1 text-xs ${statusInfo.className}`}>{statusInfo.label}</p>
          )}
        </div>
      </div>

      {carrier.status === 'connected' ? (
        <span className='flex items-center gap-1.5 text-sm text-emerald-600'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
          >
            <path d='m5 13 4 4L19 7' />
          </svg>
          Đã bật
        </span>
      ) : carrier.status === 'connecting' ? (
        <span className='h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#EE4D2D]' />
      ) : (
        <button
          type='button'
          onClick={() => onConnect(carrier.id)}
          className='cursor-pointer border border-[#EE4D2D] px-4 py-1.5 text-sm text-[#EE4D2D] hover:bg-[#FFF4F1]'
        >
          {carrier.status === 'failed' ? 'Thử lại' : 'Đăng ký'}
        </button>
      )}
    </div>
  );
}
