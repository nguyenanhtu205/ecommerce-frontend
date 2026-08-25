type OrderEmptyStateProps = {
  message: string;
};

export default function OrderEmptyState({ message }: OrderEmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-24'>
      <svg width='96' height='96' viewBox='0 0 96 96' fill='none'>
        <circle cx='48' cy='50' r='34' fill='#F2F2F2' />
        <circle cx='18' cy='24' r='3' fill='#FDBA74' />
        <circle cx='78' cy='30' r='2.5' fill='#FDBA74' />
        <circle cx='24' cy='34' r='4' fill='#BFDBFE' />
        <rect
          x='30'
          y='28'
          width='36'
          height='46'
          rx='2'
          fill='white'
          stroke='#E5B75C'
          strokeWidth='2'
        />
        <path d='M40 26h16v6H40z' fill='#E5B75C' />
        <path d='M37 40h22M37 48h22M37 56h14' stroke='#DDD' strokeWidth='2' />
        <path
          d='M55 60l10 10 14-16'
          stroke='#5EAAA8'
          strokeWidth='3'
          fill='none'
          strokeLinecap='round'
        />
      </svg>
      <p className='mt-4 text-sm text-slate-500'>{message}</p>
    </div>
  );
}
