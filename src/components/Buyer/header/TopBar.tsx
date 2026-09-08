import { useState } from 'react';
import { IoNotificationsOutline } from 'react-icons/io5';
import { MdOutlineContactSupport } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useLogout, useGetProfile, useGetAssetById } from '@/hooks';
import { useAuthStore, useChatbotWindowStore } from '@/stores';

function UserAvatar({ avatarId, alt }: { avatarId: string | null | undefined; alt: string }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { data: asset, isPending: isAssetPending } = useGetAssetById(avatarId ?? '');

  const publicUrl = asset?.publicUrl;
  const isLoading = !!avatarId && (isAssetPending || !imgLoaded);
  const showDefaultIcon = !avatarId;
  const showPlaceholder = !publicUrl || !imgLoaded;

  return (
    <div className='relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full'>
      {showDefaultIcon ? (
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          className='text-white'
        >
          <circle cx='12' cy='8' r='4' />
          <path d='M4 21c0-4 3.6-7 8-7s8 3 8 7' />
        </svg>
      ) : (
        <>
          {publicUrl && (
            <img
              src={publicUrl}
              alt={alt}
              onLoad={() => setImgLoaded(true)}
              className={`h-full w-full object-cover transition-opacity ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          {showPlaceholder && (
            <div className={`absolute inset-0 bg-white/20 ${isLoading ? 'animate-pulse' : ''}`} />
          )}
        </>
      )}
    </div>
  );
}

export default function TopBar() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const openChatbotWindow = useChatbotWindowStore((state) => state.openChatbotWindow);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isPending: isLoggingOut } = useLogout();
  const { data: profile } = useGetProfile(!!user);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <div className='sticky top-0 z-60'>
      <div className='hidden h-10 border-b border-white/10 bg-[#EE4D2D] md:block'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 text-[13px] text-white/90'>
          {/* Left links giữ nguyên */}
          <div className='flex items-center gap-4'>
            {user == null && (
              <>
                <Link to='/seller/login' className='py-1.5 hover:opacity-80'>
                  Kênh Người Bán
                </Link>
                <span className='h-3 w-px bg-white/30' />{' '}
              </>
            )}
            <Link to='#' className='py-1.5 hover:opacity-80'>
              Tải ứng dụng
            </Link>
            <span className='h-3 w-px bg-white/30' />
            {user == null && (
              <>
                <Link to='/seller/register' className='py-1.5 hover:opacity-80'>
                  Trở thành Người bán Shopee
                </Link>
                <span className='h-3 w-px bg-white/30' />
              </>
            )}
            <span className='py-1.5'>Kết nối</span>
            <div className='flex items-center gap-2'>
              <Link to='#' aria-label='Facebook' className='opacity-90 hover:opacity-100'>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z' />
                </svg>
              </Link>
              <Link to='#' aria-label='Instagram' className='opacity-90 hover:opacity-100'>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M12 2c2.7 0 3.1 0 4.1.1 1 .1 1.7.2 2.3.5.6.2 1.1.6 1.6 1.1.5.5.8.9 1.1 1.6.2.6.4 1.3.5 2.3.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c-.1 1-.2 1.7-.5 2.3-.2.6-.6 1.1-1.1 1.6-.5.5-.9.8-1.6 1.1-.6.2-1.3.4-2.3.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1-.1-1.7-.2-2.3-.5-.6-.2-1.1-.6-1.6-1.1-.5-.5-.8-.9-1.1-1.6-.2-.6-.4-1.3-.5-2.3C2 15.1 2 14.7 2 12s0-3.1.1-4.1c.1-1 .2-1.7.5-2.3.2-.6.6-1.1 1.1-1.6.5-.5.9-.8 1.6-1.1.6-.2 1.3-.4 2.3-.5C8.9 2 9.3 2 12 2Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.2-8.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z' />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right links */}
          <div className='flex items-center gap-4'>
            <Link
              to='/user/notifications'
              className='flex items-center gap-1.5 py-1.5 hover:opacity-80'
            >
              <IoNotificationsOutline className='h-4 w-4' />
              Thông Báo
            </Link>
            <button
              type='button'
              onClick={openChatbotWindow}
              className='flex cursor-pointer items-center gap-1.5 py-1.5 hover:opacity-80'
            >
              <MdOutlineContactSupport className='h-4 w-4' />
              Hỗ Trợ
            </button>

            {user ? (
              <>
                <span className='h-4 w-px bg-white/50' />
                <div
                  className='relative py-1.5'
                  onMouseEnter={() => setIsMenuOpen(true)}
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <Link to='/user'>
                    <div className='flex cursor-pointer items-center gap-2'>
                      <UserAvatar
                        avatarId={profile?.avatarUrl}
                        alt={profile?.displayName ?? user.email}
                      />

                      <span className='font-medium'>{profile?.displayName ?? user.email}</span>
                    </div>
                  </Link>

                  {isMenuOpen && (
                    <div className='absolute top-full right-0 z-60 w-40 rounded-md border border-black/5 bg-white py-1 text-[#333] shadow-lg'>
                      <button
                        onClick={() => navigate('/user/account/profile')}
                        className='block w-full cursor-pointer px-4 py-2 text-left text-sm hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Tài Khoản Của Tôi
                      </button>
                      <button
                        onClick={() => navigate('/user/purchase/all')}
                        className='block w-full cursor-pointer px-4 py-2 text-left text-sm hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        Đơn Mua
                      </button>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className='block w-full cursor-pointer px-4 py-2 text-left text-sm hover:text-[#EE4D2D] disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {isLoggingOut ? 'Đang Đăng Xuất...' : 'Đăng Xuất'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to='/buyer/register' className='py-1.5 hover:opacity-80'>
                  Đăng Ký
                </Link>
                <span className='h-4 w-px bg-white/50' />
                <Link to='/buyer/login' className='py-1.5 font-medium hover:opacity-80'>
                  Đăng Nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
