import { useGetReviewAggregate } from '@/hooks';

type ReviewAggregate = NonNullable<ReturnType<typeof useGetReviewAggregate>['data']>;
type ReviewFilterKey = 'all' | 'comment' | 'media' | 1 | 2 | 3 | 4 | 5;

type ReviewFilterBarProps = {
  aggregate: ReviewAggregate;
  activeFilter: ReviewFilterKey;
  onFilterChange: (filter: ReviewFilterKey) => void;
};

function RatingStars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className='flex gap-0.5'>
      {Array.from({ length: 5 }).map((_, i) => {
        const fillPercent = Math.min(Math.max((rating - i) * 100, 0), 100);

        return (
          <div key={i} className='relative shrink-0' style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              className='absolute inset-0 text-slate-300'
            >
              <path
                strokeWidth={1.5}
                d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z'
              />
            </svg>
            <div
              className='absolute inset-0 overflow-hidden text-[#EE4D2D]'
              style={{ width: `${fillPercent}%` }}
            >
              <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor'>
                <path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z' />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ReviewFilterBar({
  aggregate,
  activeFilter,
  onFilterChange,
}: ReviewFilterBarProps) {
  const ratingFilters: { key: ReviewFilterKey; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất Cả' },
    { key: 5, label: '5 Sao', count: aggregate.starCounts['5'] },
    { key: 4, label: '4 Sao', count: aggregate.starCounts['4'] },
    { key: 3, label: '3 Sao', count: aggregate.starCounts['3'] },
    { key: 2, label: '2 Sao', count: aggregate.starCounts['2'] },
    { key: 1, label: '1 Sao', count: aggregate.starCounts['1'] },
  ];
  const extraFilters: { key: ReviewFilterKey; label: string; count: number }[] = [
    { key: 'comment', label: 'Có Bình Luận', count: aggregate.commentCount },
    { key: 'media', label: 'Có Hình Ảnh / Video', count: aggregate.mediaCount },
  ];

  const chipClass = (key: ReviewFilterKey) =>
    `rounded-sm border px-4 py-1.5 text-sm transition ${
      activeFilter === key
        ? 'border-[#EE4D2D] text-[#EE4D2D]'
        : 'border-slate-300 text-slate-600 hover:border-slate-400'
    }`;

  return (
    <div className='rounded-sm border border-[#FDE8E2] bg-[#FFF9F6] p-6'>
      <div className='flex flex-wrap items-center gap-6'>
        <div className='shrink-0 text-center'>
          <p className='text-3xl font-medium text-[#EE4D2D]'>
            {aggregate.ratingAverage.toFixed(1)} <span className='text-lg font-normal'>trên 5</span>
          </p>
          <div className='mt-1 flex justify-center gap-0.5'>
            <RatingStars rating={aggregate.ratingAverage} />
          </div>
          <p className='mt-1 text-xs text-slate-400'>{aggregate.ratingCount} đánh giá</p>
        </div>

        <div className='flex flex-1 flex-wrap gap-2.5'>
          {ratingFilters.map((f) => (
            <button
              key={f.key}
              type='button'
              onClick={() => onFilterChange(f.key)}
              className={chipClass(f.key)}
            >
              {f.label}
              {f.count !== undefined && ` (${f.count})`}
            </button>
          ))}
          {extraFilters.map((f) => (
            <button
              key={f.key}
              type='button'
              onClick={() => onFilterChange(f.key)}
              className={chipClass(f.key)}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
