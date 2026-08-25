import type { SalesAnalytics, SalesMetric } from '@/types';
import { Link } from 'react-router-dom';

type SalesAnalyticsSectionProps = {
  data: SalesAnalytics;
};

function formatValue(metric: SalesMetric) {
  if (metric.isPercentValue) return metric.value.toFixed(2) + '%';
  return metric.value.toLocaleString('vi-VN');
}

function MetricBlock({ metric }: { metric: SalesMetric }) {
  const change = metric.changePercent;
  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;

  return (
    <div>
      <p className='flex items-center gap-1 text-sm text-slate-400'>
        {metric.label}
        <svg
          width='12'
          height='12'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
        >
          <circle cx='12' cy='12' r='9' />
          <path d='M12 16v-5M12 8h.01' />
        </svg>
      </p>
      <p className='mt-1 text-2xl font-medium text-slate-800'>{formatValue(metric)}</p>
      {change !== null && (
        <p
          className={`mt-1 text-xs ${
            isUp ? 'text-emerald-600' : isDown ? 'text-red-500' : 'text-slate-400'
          }`}
        >
          Vs hôm qua {change.toFixed(2)}% {isUp ? '↑' : isDown ? '↓' : '—'}
        </p>
      )}
    </div>
  );
}

export default function SalesAnalyticsSection({ data }: SalesAnalyticsSectionProps) {
  return (
    <div className='mt-3 bg-white p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-base font-medium text-slate-800'>Phân Tích Bán Hàng</h2>
          <p className='mt-1 text-sm text-slate-400'>
            {data.periodLabel} — Tổng quan dữ liệu của shop đối với đơn hàng đã xác nhận
          </p>
        </div>
        <Link to='/seller/data/sales-analytics' className='text-sm text-[#EE4D2D] hover:opacity-80'>
          Xem thêm &gt;
        </Link>
      </div>

      <div className='mt-6 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5'>
        <MetricBlock metric={data.revenue} />
        <MetricBlock metric={data.visitors} />
        <MetricBlock metric={data.views} />
        <MetricBlock metric={data.orders} />
        <MetricBlock metric={data.conversionRate} />
      </div>
    </div>
  );
}
