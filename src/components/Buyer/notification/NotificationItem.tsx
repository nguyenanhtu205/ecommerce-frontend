import { type Notification } from '@/types';

type NotificationItemProps = {
  notification: Notification;
};

export default function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <a
      href={notification.link ?? '#'}
      className={`flex gap-4 border-b border-slate-100 px-6 py-4 hover:bg-slate-50 ${
        notification.isRead ? '' : 'bg-[#FFF9F6]'
      }`}
    >
      {notification.imageUrl ? (
        <img src={notification.imageUrl} alt='' className='h-12 w-12 shrink-0 object-cover' />
      ) : (
        <span className='flex h-12 w-12 shrink-0 items-center justify-center bg-slate-100 text-slate-400'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
          >
            <path d='M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' />
            <path d='M13.7 21a2 2 0 0 1-3.4 0' />
          </svg>
        </span>
      )}
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-slate-800'>{notification.title}</p>
        <p className='mt-1 line-clamp-2 text-sm text-slate-500'>{notification.content}</p>
        <p className='mt-1.5 text-xs text-slate-400'>{notification.createdAt}</p>
      </div>
      {!notification.isRead && <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-[#EE4D2D]' />}
    </a>
  );
}
