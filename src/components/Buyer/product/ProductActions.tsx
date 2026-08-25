import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useAddToCart } from '@/hooks';

type CartItemBase = {
  combinationId: string;
  priceSnapshot: number;
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  thumbnailUrl: string;
  variation: string;
  shippingInfo: {
    weightGrams: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
};

type ProductActionsProps = {
  quantity: number;
  stock: number;
  disabled?: boolean;
  disabledByVacation?: boolean;
  cartItem: CartItemBase | null;
  onQuantityChange: (value: number) => void;
};

export default function ProductActions({
  quantity,
  stock,
  disabled,
  disabledByVacation = false,
  cartItem,
  onQuantityChange,
}: ProductActionsProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { addToCart, isPending, errorMessage } = useAddToCart();

  const clamp = (value: number) => Math.min(Math.max(value, 1), Math.max(stock, 1));

  const requireAuth = () => {
    if (!user) {
      navigate('/buyer/login');
      return false;
    }
    return true;
  };

  const submit = (isSelected: boolean) => {
    if (!requireAuth()) return;
    if (!cartItem) return;
    addToCart({ ...cartItem, quantity, isSelected }, { onSuccess: () => navigate('/cart') });
  };

  const handleAddToCart = () => submit(false);
  const handleBuyNow = () => submit(true);

  const isActionDisabled = disabled || disabledByVacation || isPending;

  return (
    <div>
      <div className='flex items-center gap-6'>
        <span className='w-20 shrink-0 text-sm text-slate-500'>Số lượng</span>
        <div className='flex items-center rounded-sm border border-slate-300'>
          <button
            type='button'
            disabled={disabled}
            onClick={() => onQuantityChange(clamp(quantity - 1))}
            className='flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            −
          </button>
          <input
            type='text'
            value={quantity}
            disabled={disabled}
            onChange={(e) => {
              const num = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
              onQuantityChange(clamp(Number.isNaN(num) ? 1 : num));
            }}
            className='h-9 w-14 border-x border-slate-300 text-center text-sm outline-none disabled:bg-slate-50'
          />
          <button
            type='button'
            disabled={disabled}
            onClick={() => onQuantityChange(clamp(quantity + 1))}
            className='flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            +
          </button>
        </div>
        <span className='text-xs text-red-500'>
          {disabled ? 'Hết hàng' : `${stock} sản phẩm có sẵn`}
        </span>
      </div>

      <div className='mt-6 flex gap-3'>
        <span
          className='relative'
          title={disabledByVacation ? 'Shop đang tạm đóng cửa' : undefined}
        >
          <button
            type='button'
            disabled={isActionDisabled}
            onClick={handleAddToCart}
            className='flex cursor-pointer items-center gap-2 rounded-sm border border-[#EE4D2D] px-6 py-2.5 text-sm font-medium text-[#EE4D2D] hover:bg-[#FFF4F1] disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent'
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M6 6h15l-1.5 9h-12z' />
              <path d='M6 6 5 3H2' />
              <circle cx='9' cy='20' r='1' />
              <circle cx='18' cy='20' r='1' />
            </svg>

            {isPending ? 'Đang xử lý...' : 'Thêm Vào Giỏ Hàng'}
          </button>
        </span>

        <span
          className='relative'
          title={disabledByVacation ? 'Shop đang tạm đóng cửa' : undefined}
        >
          <button
            type='button'
            disabled={isActionDisabled}
            onClick={handleBuyNow}
            className='cursor-pointer rounded-sm bg-[#EE4D2D] px-10 py-2.5 text-sm font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:bg-slate-300'
          >
            {isPending ? 'Đang xử lý...' : 'Mua Ngay'}
          </button>
        </span>
      </div>

      {errorMessage && <p className='mt-2 text-xs text-red-500'>{errorMessage}</p>}
    </div>
  );
}
