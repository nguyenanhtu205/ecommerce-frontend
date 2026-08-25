type NotificationEmptyStateProps = {
  imageUrl: string;
  message: string;
};

export default function NotificationEmptyState({ imageUrl, message }: NotificationEmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-28'>
      <img src={imageUrl} alt='' className='h-24 w-24' />
      <p className='mt-4 text-sm text-slate-600'>{message}</p>
    </div>
  );
}
