type StarRatingProps = {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
};

export default function StarRating({
  value,
  onChange,
  size = 24,
  readOnly = false,
}: StarRatingProps) {
  return (
    <div className='flex gap-1'>
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type='button'
          disabled={readOnly}
          onClick={() => onChange?.(i + 1)}
          className={`text-[#EE4D2D] ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <svg
            width={size}
            height={size}
            viewBox='0 0 24 24'
            fill={i < value ? 'currentColor' : 'none'}
            stroke='currentColor'
            strokeWidth='1.5'
          >
            <path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z' />
          </svg>
        </button>
      ))}
    </div>
  );
}
