import { type ProductFormTabKey } from '@/types';

type ProductFormTabsProps = {
  activeTab: ProductFormTabKey;
  onChange: (tab: ProductFormTabKey) => void;
};

const TABS: { key: ProductFormTabKey; label: string }[] = [
  { key: 'basic', label: 'Thông tin cơ bản' },
  { key: 'sales', label: 'Thông tin bán hàng' },
  { key: 'shipping', label: 'Vận chuyển' },
  { key: 'other', label: 'Thông tin khác' },
];

export default function ProductFormTabs({ activeTab, onChange }: ProductFormTabsProps) {
  return (
    <div className='flex gap-8 border-b border-slate-200 bg-white px-6'>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type='button'
          onClick={() => onChange(tab.key)}
          className={`cursor-pointer border-b-2 py-3 text-sm ${
            activeTab === tab.key
              ? 'border-[#EE4D2D] font-medium text-[#EE4D2D]'
              : 'border-transparent text-slate-600 hover:text-[#EE4D2D]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
