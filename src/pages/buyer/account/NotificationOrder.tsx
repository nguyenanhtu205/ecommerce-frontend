import { NotificationItem, NotificationEmptyState } from '@/components';
import { MOCK_ORDER_NOTIFICATIONS } from '@/assets';

export default function NotificationOrder() {
  return (
    <div className='border border-slate-100 bg-white'>
      {MOCK_ORDER_NOTIFICATIONS.length === 0 ? (
        <NotificationEmptyState
          imageUrl='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/12fe8880616de161.png'
          message='Chưa có cập nhật đơn hàng'
        />
      ) : (
        MOCK_ORDER_NOTIFICATIONS.map((n) => <NotificationItem key={n.id} notification={n} />)
      )}
    </div>
  );
}
