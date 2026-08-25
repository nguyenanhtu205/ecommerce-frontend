import { Link } from 'react-router-dom';
import { SiShopee } from 'react-icons/si';

export default function CartTopBar() {
  return (
    <div className='border-b border-slate-100 bg-white py-4'>
      <div className='mx-auto flex max-w-7xl items-center gap-10 px-4'>
        <div className='flex items-center'>
          <Link to='/' className='flex shrink-0 items-center gap-2'>
            <SiShopee className='h-10 w-10 pb-1 text-[#EE4D2D]' />
            <span className='text-2xl text-[#EE4D2D]'>Shopee</span>
          </Link>

          <div className='mx-4 h-8 w-0.5 bg-[#EE4D2D]' />

          <span className='text-lg text-[#EE4D2D]'>Giỏ Hàng</span>
        </div>

        <div className='ml-auto flex w-full max-w-xl items-stretch'>
          <input
            type='text'
            placeholder='QUÀ TẶNG 500,000Đ'
            className='w-full border border-r-0 border-[#EE4D2D] px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400'
          />
          <button
            type='button'
            className='flex shrink-0 cursor-pointer items-center justify-center bg-[#EE4D2D] px-6 hover:bg-[#d8431f]'
            aria-label='Tìm kiếm'
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='white'
              strokeWidth='2.5'
            >
              <circle cx='11' cy='11' r='7' />
              <path d='m21 21-4.3-4.3' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
