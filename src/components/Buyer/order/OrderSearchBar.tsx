type OrderSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function OrderSearchBar({ value, onChange }: OrderSearchBarProps) {
  return (
    <div className='flex items-center gap-2 bg-slate-100 px-6 py-3'>
      <svg
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        className='text-slate-400'
      >
        <circle cx='11' cy='11' r='7' />
        <path d='m21 21-4.3-4.3' />
      </svg>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm'
        className='w-full bg-transparent text-sm text-slate-500 outline-none placeholder:text-slate-400'
      />
    </div>
  );
}
