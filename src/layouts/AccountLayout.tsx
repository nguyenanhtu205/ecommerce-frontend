import { Outlet } from 'react-router-dom';
import { AccountSidebar, Footer } from '@/components';
import { useGetProfile } from '@/hooks';
import { useAuthStore } from '@/stores';

export default function AccountLayout() {
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useGetProfile(!!user);
  const username = profile?.displayName ?? user!.email;

  return (
    <div className='min-h-screen bg-[#F5F5F5]'>
      <div className='mx-auto flex max-w-7xl gap-8 px-4 py-6'>
        <AccountSidebar username={username} avatarId={profile?.avatarUrl} />
        <main className='min-w-0 flex-1 pb-4'>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
