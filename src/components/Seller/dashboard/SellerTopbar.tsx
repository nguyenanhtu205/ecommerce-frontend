import { SiShopee } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useLogout } from '@/hooks';

export default function SellerTopBar() {
  const { logout, isPending } = useLogout();

  return (
    <header className='flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6'>
      <div className='flex items-center'>
        <Link to='/seller' className='flex items-center gap-1.5'>
          <SiShopee className='h-8 w-8 pb-1 text-[#EE4D2D]' />
          <span className='text-xl text-[#EE4D2D]'>Shopee</span>
        </Link>
        <span className='ml-4 text-lg text-slate-500'>Kênh Người Bán</span>
      </div>

      <button
        type='button'
        onClick={() => logout()}
        disabled={isPending}
        className='flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[#EE4D2D] disabled:opacity-50'
      >
        <LogOut className='h-4 w-4' />
        {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
    </header>
  );
}
