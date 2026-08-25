export type TodoItem = {
  id: number;
  label: string;
  count: number;
  actionLabel: string;
  link: string;
};

export type SalesMetric = {
  label: string;
  value: number;
  changePercent: number | null;
  isPercentValue?: boolean;
};

export type SalesAnalytics = {
  periodLabel: string;
  updatedAt: string;
  revenue: SalesMetric;
  visitors: SalesMetric;
  views: SalesMetric;
  orders: SalesMetric;
  conversionRate: SalesMetric;
};

export type PerformanceTabKey = 'order_management' | 'listing_violation' | 'customer_service';

export type PerformanceMetric = {
  id: number;
  criteria: string;
  shopValue: number | null;
  targetLabel: string;
  isPassing: boolean | null;
};
