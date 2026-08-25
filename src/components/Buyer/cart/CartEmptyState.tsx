import { useNavigate } from 'react-router-dom';

export default function CartEmptyState() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center py-24'>
      <img
        src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/12fe8880616de161.png'
        alt=''
        className='h-32 w-32'
      />
      <p className='mt-4 text-base text-slate-600'>Giỏ hàng của bạn còn trống</p>

      <button
        type='button'
        onClick={() => navigate('/')}
        className='mt-4 bg-[#EE4D2D] px-8 py-2.5 text-sm font-medium text-white hover:bg-[#d8431f]'
      >
        MUA NGAY
      </button>
    </div>
  );
}
