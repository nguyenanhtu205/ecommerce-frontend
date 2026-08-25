type CartSummaryBarProps = {
  allSelected: boolean;
  selectedCount: number;
  totalAmount: number;
  onToggleAll: () => void;
  onRemoveSelected: () => void;
  onCheckout: () => void;
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

export default function CartSummaryBar({
  allSelected,
  selectedCount,
  totalAmount,
  onToggleAll,
  onRemoveSelected,
  onCheckout,
}: CartSummaryBarProps) {
  return (
    <div className='mt-3 flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4'>
      <div className='flex items-center gap-6 text-sm'>
        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            checked={allSelected}
            onChange={onToggleAll}
            className='h-4 w-4 accent-[#EE4D2D]'
          />
          Chọn Tất Cả ({selectedCount})
        </label>
        <button
          onClick={onRemoveSelected}
          className='cursor-pointer text-black hover:text-[#EE4D2D]'
        >
          Xóa
        </button>
        <button className='cursor-pointer text-[#EE4D2D] hover:opacity-80'>
          Lưu vào mục Đã thích
        </button>
      </div>

      <div className='flex items-center gap-4'>
        <span className='text-sm text-slate-700'>
          Tổng cộng ({selectedCount} sản phẩm):{' '}
          <span className='text-xl font-medium text-[#EE4D2D]'>{formatPrice(totalAmount)}</span>
        </span>
        <button
          onClick={onCheckout}
          disabled={selectedCount === 0}
          className={`px-10 py-2.5 text-sm font-medium text-white ${
            selectedCount > 0
              ? 'cursor-pointer bg-[#EE4D2D] hover:bg-[#d8431f]'
              : 'cursor-not-allowed bg-[#EE4D2D]/50'
          }`}
        >
          Mua Hàng
        </button>
      </div>
    </div>
  );
}
