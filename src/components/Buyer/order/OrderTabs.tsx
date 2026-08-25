import type { OrderTabKey } from '@/types';

type TabConfig = {
  key: OrderTabKey;
  label: string;
};

type OrderTabsProps = {
  activeTab: OrderTabKey;
  onChange: (tab: OrderTabKey) => void;
};

const TABS: TabConfig[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_payment', label: 'Chờ thanh toán' },
  { key: 'shipping', label: 'Vận chuyển' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'return_refund', label: 'Trả hàng/Hoàn tiền' },
];

export default function OrderTabs({ activeTab, onChange }: OrderTabsProps) {
  return (
    <div className='flex items-center justify-between border-b border-slate-200 bg-white px-6'>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type='button'
          onClick={() => onChange(tab.key)}
          className={`cursor-pointer border-b-2 px-1 py-4 text-sm whitespace-nowrap ${
            activeTab === tab.key
              ? 'border-[#EE4D2D] text-[#EE4D2D]'
              : 'border-transparent text-slate-700 hover:text-[#EE4D2D]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
