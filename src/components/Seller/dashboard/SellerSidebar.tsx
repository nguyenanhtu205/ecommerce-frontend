import { useState } from 'react';
import { NavLink } from 'react-router-dom';

type MenuChild = {
  label: string;
  path: string;
  badge?: string;
};

type MenuGroup = {
  id: string;
  label: string;
  badgeDot?: boolean;
  children: MenuChild[];
};

const MENU_GROUPS: MenuGroup[] = [
  {
    id: 'order',
    label: 'Quản Lý Đơn Hàng',
    children: [
      { label: 'Tất cả', path: '/seller/orders/all' },
      { label: 'Hoàn thành', path: '/seller/orders/completed' },
      { label: 'Vận chuyển', path: '/seller/orders/shipping' },
      { label: 'Chờ thanh toán', path: '/seller/orders/pending_payment' },
      { label: 'Đơn Hủy', path: '/seller/orders/cancelled' },
      { label: 'Trả Hàng/Hoàn Tiền', path: '/seller/orders/return-refund' },
      { label: 'Cài Đặt Vận Chuyển', path: '/seller/shop/settings/shipping' },
    ],
  },
  {
    id: 'product',
    label: 'Quản Lý Sản Phẩm',
    children: [
      { label: 'Tất Cả Sản Phẩm', path: '/seller/products/all' },
      { label: 'Thêm Sản Phẩm', path: '/seller/products/new' },
    ],
  },
  {
    id: 'marketing',
    label: 'Kênh Marketing',
    children: [
      { label: 'Kênh Marketing', path: '/seller/marketing' },
      { label: 'Đấu Giá Rẻ Vô Địch', path: '/seller/marketing/bid-auction', badge: 'New' },
      { label: 'Quảng Cáo Shopee', path: '/seller/marketing/ads' },
      { label: 'Tặng Đơn Cùng KOL', path: '/seller/marketing/kol' },
      { label: 'Live & Video', path: '/seller/marketing/live-video' },
      { label: 'Khuyến Mãi Của Shop', path: '/seller/marketing/shop-promotion' },
      { label: 'Flash Sale Của Shop', path: '/seller/marketing/flash-sale' },
      { label: 'Mã Giảm Giá Của Shop', path: '/seller/marketing/vouchers' },
      { label: 'Chương Trình Shopee', path: '/seller/marketing/shopee-program' },
    ],
  },
  {
    id: 'customer-service',
    label: 'Chăm Sóc Khách Hàng',
    children: [
      { label: 'Quản Lý Chat', path: '/seller/customer-service/chat' },
      { label: 'Quản Lý Đánh Giá', path: '/seller/customer-service/reviews' },
    ],
  },
  {
    id: 'finance',
    label: 'Tài Chính',
    children: [
      { label: 'Doanh Thu', path: '/seller/finance/revenue' },
      { label: 'Số Dư TK Shopee', path: '/seller/finance/balance' },
      { label: 'Tài Khoản Ngân Hàng', path: '/seller/finance/bank-account' },
    ],
  },
  {
    id: 'data',
    label: 'Dữ Liệu',
    children: [
      { label: 'Phân Tích Bán Hàng', path: '/seller/data/sales-analytics' },
      { label: 'Hiệu Quả Hoạt Động', path: '/seller/data/performance' },
    ],
  },
  {
    id: 'shop',
    label: 'Quản Lý Shop',
    children: [
      { label: 'Hồ Sơ Shop', path: '/seller/shop/profile' },
      { label: 'Trang Trí Shop', path: '/seller/shop/decoration' },
      { label: 'Thiết Lập Shop', path: '/seller/shop/settings' },
    ],
  },
];

export default function SellerSidebar() {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className='h-full w-64 shrink-0 overflow-y-auto border-r border-slate-100 bg-white py-2'>
      {MENU_GROUPS.map((group) => {
        const isExpanded = expandedGroups.has(group.id);
        return (
          <div key={group.id} className='border-b border-slate-50'>
            <button
              type='button'
              onClick={() => toggleGroup(group.id)}
              className='flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 hover:text-[#EE4D2D]'
            >
              <span className='flex items-center gap-1.5'>
                {group.label}
                {group.badgeDot && <span className='h-1.5 w-1.5 rounded-full bg-[#EE4D2D]' />}
              </span>
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                <path d='m6 9 6 6 6-6' />
              </svg>
            </button>

            {isExpanded && (
              <div className='pb-2'>
                {group.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-8 py-2 text-sm ${
                        isActive
                          ? 'border-r-2 border-[#EE4D2D] bg-[#FFF4F1] font-medium text-[#EE4D2D]'
                          : 'text-slate-500 hover:text-[#EE4D2D]'
                      }`
                    }
                  >
                    {child.label}
                    {child.badge && (
                      <span className='rounded-sm bg-[#EE4D2D] px-1.5 py-0.5 text-[10px] font-bold text-white'>
                        {child.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
