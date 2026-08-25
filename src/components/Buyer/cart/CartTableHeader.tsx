type CartTableHeaderProps = {
  allSelected: boolean;
  onToggleAll: () => void;
};

export default function CartTableHeader({ allSelected, onToggleAll }: CartTableHeaderProps) {
  return (
    <div className='grid grid-cols-[auto_1fr_140px_140px_120px_140px] items-center gap-4 bg-white px-6 py-3 text-sm text-slate-500'>
      <input
        type='checkbox'
        checked={allSelected}
        onChange={onToggleAll}
        className='h-4 w-4 accent-[#EE4D2D]'
      />
      <span className='text-black'>Sản Phẩm</span>
      <span className='text-right'>Đơn Giá</span>
      <span className='text-center'>Số Lượng</span>
      <span className='text-right'>Số Tiền</span>
      <span className='text-center'>Thao Tác</span>
    </div>
  );
}
