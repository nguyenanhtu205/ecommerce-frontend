import { TodoChecklist, SalesAnalyticsSection, PerformanceSection } from '@/components';
import { MOCK_TODOS, MOCK_SALES_ANALYTICS, PERFORMANCE_METRICS } from '@/assets';

export default function SellerDashboard() {
  return (
    <div className='-my-2 pr-10'>
      <TodoChecklist todos={MOCK_TODOS} />
      <SalesAnalyticsSection data={MOCK_SALES_ANALYTICS} />
      <PerformanceSection metricsByTab={PERFORMANCE_METRICS} />
    </div>
  );
}
