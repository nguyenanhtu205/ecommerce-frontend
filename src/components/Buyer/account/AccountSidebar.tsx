import { type ReactNode, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useGetAssetById } from '@/hooks';

type MenuChild = {
  label: string;
  path: string;
};

type MenuGroup = {
  id: string;
  label: string;
  icon: ReactNode;
  path?: string;
  children?: MenuChild[];
};

type AccountSidebarProps = {
  username: string;
  avatarId: string | null | undefined;
};

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'notifications',
    label: 'Thông Báo',
    icon: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <path d='M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' />
        <path d='M13.7 21a2 2 0 0 1-3.4 0' />
      </svg>
    ),
    children: [
      { label: 'Đơn Hàng', path: '/user/notifications/order' },
      { label: 'Khuyến Mãi', path: '/user/notifications/promotion' },
      { label: 'Shopee', path: '/user/notifications/system' },
    ],
  },
  {
    id: 'account',
    label: 'Tài Khoản Của Tôi',
    icon: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <circle cx='12' cy='8' r='4' />
        <path d='M4 21c0-4 3.6-7 8-7s8 3 8 7' />
      </svg>
    ),
    children: [
      { label: 'Hồ Sơ', path: '/user/account/profile' },
      { label: 'Thanh toán', path: '/user/account/payment' },
      { label: 'Địa Chỉ', path: '/user/account/address' },
      { label: 'Đổi Mật Khẩu', path: '/user/account/password' },
    ],
  },
  {
    id: 'purchase',
    label: 'Đơn Mua',
    icon: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <rect x='4' y='4' width='16' height='17' rx='1' />
        <path d='M8 9h8M8 13h8M8 17h5' />
      </svg>
    ),
    path: '/user/purchase',
  },
  {
    id: 'vouchers',
    label: 'Kho Voucher',
    icon: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <path d='M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z' />
      </svg>
    ),
    path: '/user/vouchers',
  },
  {
    id: 'shopee-xu',
    label: 'Shopee Xu',
    icon: (
      <svg
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <circle cx='12' cy='12' r='9' />
        <text x='12' y='16' fontSize='10' textAnchor='middle' fill='currentColor' stroke='none'>
          S
        </text>
      </svg>
    ),
    path: '/user/shopee-xu',
  },
];

function UserAvatar({ avatarId, alt }: { avatarId: string | null | undefined; alt: string }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { data: asset, isPending: isAssetPending } = useGetAssetById(avatarId ?? '');

  const publicUrl = asset?.publicUrl;
  const isLoading = !!avatarId && (isAssetPending || !imgLoaded);
  const showDefaultIcon = !avatarId;
  const showPlaceholder = !publicUrl || !imgLoaded;

  return (
    <div className='relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200'>
      {showDefaultIcon ? (
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          className='text-gray-500'
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

export default function AccountSidebar({ username, avatarId }: AccountSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isGroupActive = (group: MenuGroup) => {
    if (group.children) return group.children.some((c) => location.pathname.startsWith(c.path));
    return group.path ? location.pathname.startsWith(group.path) : false;
  };

  const handleGroupClick = (group: MenuGroup) => {
    if (group.children && group.children.length > 0) {
      navigate(group.children[0].path);
    } else if (group.path) {
      navigate(group.path);
    }
  };

  return (
    <aside className='w-64 shrink-0'>
      {/* Mini user card */}
      <div className='flex items-center gap-3 border-b border-slate-100 pb-4'>
        <UserAvatar avatarId={avatarId} alt={username} />
        <div>
          <p className='text-sm font-medium text-slate-800'>{username}</p>
          <Link
            to={'/user/account/profile'}
            className='flex items-center gap-1 text-xs text-slate-400 hover:text-[#EE4D2D]'
          >
            <svg
              width='11'
              height='11'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' />
            </svg>
            Sửa Hồ Sơ
          </Link>
        </div>
      </div>

      <nav className='mt-2'>
        {MENU_GROUPS.map((group) => {
          const active = isGroupActive(group);
          return (
            <div key={group.id} className='mb-1'>
              <button
                type='button'
                onClick={() => handleGroupClick(group)}
                className={`flex w-full cursor-pointer items-center gap-2.5 px-1 py-2.5 text-left text-sm ${
                  active && !group.children ? 'font-medium text-[#EE4D2D]' : 'text-slate-700'
                } hover:text-[#EE4D2D]`}
              >
                {group.icon}
                {group.label}
              </button>

              {group.children && active && (
                <div className='ml-6.5 flex flex-col border-l border-slate-100 pl-3.5'>
                  {group.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `py-1.5 text-[13px] ${
                          isActive
                            ? 'font-medium text-[#EE4D2D]'
                            : 'text-slate-500 hover:text-[#EE4D2D]'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
