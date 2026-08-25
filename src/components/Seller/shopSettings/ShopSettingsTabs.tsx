import { NavLink } from 'react-router-dom';
import { type ShopSettingsTabKey } from '@/types';

const TABS: { key: ShopSettingsTabKey; label: string }[] = [
  { key: 'account-security', label: 'Tài Khoản & Bảo Mật' },
  { key: 'shipping', label: 'Cài Đặt Vận Chuyển' },
  { key: 'payment', label: 'Cài Đặt Thanh Toán' },
  { key: 'chat', label: 'Cài Đặt Chat' },
  { key: 'vacation-mode', label: 'Chế Độ Tạm Nghỉ' },
];

export default function ShopSettingsTabs() {
  return (
    <div className='flex gap-8 border-b border-slate-200 bg-white px-6'>
      {TABS.map((tab) => (
        <NavLink
          key={tab.key}
          to={`/seller/shop/settings/${tab.key}`}
          className={({ isActive }) =>
            `border-b-2 py-3 text-sm whitespace-nowrap ${
              isActive
                ? 'border-[#EE4D2D] font-medium text-[#EE4D2D]'
                : 'border-transparent text-slate-600 hover:text-[#EE4D2D]'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
