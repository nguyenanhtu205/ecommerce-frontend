import { NotificationItem, NotificationEmptyState } from '@/components';
import { MOCK_SYSTEM_NOTIFICATIONS } from '@/assets';

export default function NotificationSystem() {
  return (
    <div className='border border-slate-100 bg-white'>
      {MOCK_SYSTEM_NOTIFICATIONS.length === 0 ? (
        <NotificationEmptyState
          imageUrl='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/f2641127a1ad2410.png'
          message='Chưa có cập nhật mới từ Shopee'
        />
      ) : (
        MOCK_SYSTEM_NOTIFICATIONS.map((n) => <NotificationItem key={n.id} notification={n} />)
      )}
    </div>
  );
}
