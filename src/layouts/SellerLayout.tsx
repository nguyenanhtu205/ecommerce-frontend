import { Outlet } from 'react-router-dom';
import { SellerTopbar, SellerSidebar, ChatButton, ChatWindow } from '@/components';
import { useShopInformation } from '@/hooks';

export default function SellerLayout() {
  useShopInformation();

  return (
    <div className='flex h-screen flex-col bg-[#F5F5F5]'>
      <SellerTopbar />
      <div className='flex flex-1 overflow-hidden'>
        <SellerSidebar />
        <main className='flex-1 overflow-y-auto p-6'>
          <Outlet />
        </main>
      </div>
      <ChatButton />
      <ChatWindow />
    </div>
  );
}
