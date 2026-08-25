import { SiShopee } from 'react-icons/si';
import { Link } from 'react-router-dom';

type AuthHeaderProps = {
  title?: string;
};

export default function AuthHeader({ title = 'Đăng ký' }: AuthHeaderProps) {
  return (
    <header className='border-b border-slate-100 bg-white'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-3'>
        <div className='flex items-center gap-2.5'>
          <Link to='/' className='flex items-center gap-2.5'>
            <SiShopee className='h-8 w-8 pb-1 text-[#EE4D2D]' />
            <span className='text-xl text-[#EE4D2D]'>Shopee</span>
          </Link>

          <span className='ml-2 text-lg text-slate-500'>{title}</span>
        </div>

        <Link to='/help' className='text-sm text-[#EE4D2D] hover:opacity-80'>
          Bạn cần giúp đỡ?
        </Link>
      </div>
    </header>
  );
}
