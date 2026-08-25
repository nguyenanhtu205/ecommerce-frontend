import { Outlet } from 'react-router-dom';
import { Footer } from '@/components';

export default function MainLayout() {
  return (
    <div className='flex min-h-screen flex-col bg-[#F5F5F5]'>
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
