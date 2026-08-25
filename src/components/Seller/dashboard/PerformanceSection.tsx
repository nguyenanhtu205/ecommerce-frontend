import { useState } from 'react';
import type { PerformanceMetric, PerformanceTabKey } from '@/types';
import { Link } from 'react-router-dom';

interface PerformanceSectionProps {
  metricsByTab: Record<PerformanceTabKey, PerformanceMetric[]>;
}

const TABS: { key: PerformanceTabKey; label: string }[] = [
  { key: 'order_management', label: 'Quản Lý Đơn Hàng' },
  { key: 'listing_violation', label: 'Vi Phạm Về Đăng Bán' },
  { key: 'customer_service', label: 'Chăm Sóc Khách Hàng' },
];

export default function PerformanceSection({ metricsByTab }: PerformanceSectionProps) {
  const [activeTab, setActiveTab] = useState<PerformanceTabKey>('order_management');
  const metrics = metricsByTab[activeTab];

  return (
    <div className='mt-3 bg-white p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-base font-medium text-slate-800'>Hiệu Quả Hoạt Động</h2>
          <p className='mt-1 text-sm text-slate-400'>
            Bảng Hiệu Quả Hoạt Động giúp Người Bán hiểu rõ hơn về hoạt động buôn bán của Shop mình
            dựa trên những chỉ tiêu sau.
          </p>
        </div>
        <Link
          to='/seller/data/performance'
          className='shrink-0 text-sm text-[#EE4D2D] hover:opacity-80'
        >
          Xem thêm &gt;
        </Link>
      </div>

      <div className='mt-4 flex gap-6 border-b border-slate-100'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type='button'
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer border-b-2 pb-2.5 text-sm ${
              activeTab === tab.key
                ? 'border-[#EE4D2D] font-medium text-[#EE4D2D]'
                : 'border-transparent text-slate-500 hover:text-[#EE4D2D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <table className='mt-4 w-full text-sm'>
        <thead>
          <tr className='text-left text-slate-400'>
            <th className='pb-2 font-normal'>Tiêu Chí</th>
            <th className='pb-2 text-right font-normal'>Shop Của Tôi</th>
            <th className='pb-2 text-right font-normal'>Chỉ Tiêu</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-50'>
          {metrics.map((m) => (
            <tr key={m.id}>
              <td className='py-3 text-slate-700'>{m.criteria}</td>
              <td className='py-3 text-right text-slate-700'>{m.shopValue ?? '-'}</td>
              <td className='py-3 text-right text-slate-400'>{m.targetLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
