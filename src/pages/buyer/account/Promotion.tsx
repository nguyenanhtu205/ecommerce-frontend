import { type Notification } from '@/types';
import { MOCK_PROMOTION_NOTIFICATIONS } from '@/assets';
import { NotificationEmptyState } from '@/components';

function PromotionRow({ notification, isLast }: { notification: Notification; isLast: boolean }) {
  return (
    <div
      className={`flex items-start gap-5 px-5 py-5 ${isLast ? '' : 'border-b border-slate-100'}`}
    >
      <img
        src={notification.imageUrl}
        alt={notification.title}
        className='h-20 w-20 shrink-0 rounded-sm object-cover'
      />
      <div className='min-w-0 flex-1'>
        <h3 className='text-[15px] font-medium text-slate-800'>{notification.title}</h3>
        <p className='mt-1 text-sm leading-5 text-slate-500'>{notification.content}</p>
        <p className='mt-1 text-sm text-slate-500'>{notification.createdAt}</p>
      </div>
      <a
        href={notification.link ?? '#'}
        className='shrink-0 border border-slate-300 bg-white p-1 text-xs text-black hover:border-[#EE4D2D] hover:text-[#EE4D2D]'
      >
        Xem Chi Tiết
      </a>
    </div>
  );
}

export default function Promotion() {
  return (
    <div className='rounded-sm bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b border-slate-100 px-8 py-5'>
        <div>
          <h1 className='text-lg font-medium text-slate-800'>Thông Báo Khuyến Mãi</h1>
          <p className='mt-1 text-sm text-slate-400'>
            Các ưu đãi và mã giảm giá dành riêng cho bạn
          </p>
        </div>
      </div>

      {MOCK_PROMOTION_NOTIFICATIONS.length === 0 ? (
        <NotificationEmptyState
          imageUrl='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/f2641127a1ad2410.png'
          message='Chưa có khuyến mãi mới'
        />
      ) : (
        MOCK_PROMOTION_NOTIFICATIONS.map((n, idx) => (
          <PromotionRow
            key={n.id}
            notification={n}
            isLast={idx === MOCK_PROMOTION_NOTIFICATIONS.length - 1}
          />
        ))
      )}
    </div>
  );
}
