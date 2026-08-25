import type { TodoItem, SalesAnalytics, PerformanceMetric, PerformanceTabKey } from '@/types';

export const MOCK_TODOS: TodoItem[] = [
  {
    id: 1,
    label: 'Đơn hàng chờ xác nhận',
    count: 3,
    actionLabel: 'Xử lý ngay',
    link: '/seller/orders/pending',
  },
  {
    id: 2,
    label: 'Sản phẩm vi phạm cần chỉnh sửa',
    count: 1,
    actionLabel: 'Chỉnh sửa',
    link: '/seller/products/violation',
  },
  {
    id: 3,
    label: 'Tin nhắn khách hàng chưa trả lời',
    count: 5,
    actionLabel: 'Trả lời',
    link: '/seller/chat',
  },
];

export const MOCK_SALES_ANALYTICS: SalesAnalytics = {
  periodLabel: 'Hôm nay 00:00 GMT+7 - 11:00',
  updatedAt: new Date().toISOString(),
  revenue: { label: 'Doanh số', value: 0, changePercent: 0 },
  visitors: { label: 'Lượt truy cập', value: 0, changePercent: 0 },
  views: { label: 'Lượt xem', value: 0, changePercent: 0 },
  orders: { label: 'Đơn hàng', value: 0, changePercent: 0 },
  conversionRate: { label: 'Tỷ lệ chuyển đổi', value: 0, changePercent: 0, isPercentValue: true },
};

export const PERFORMANCE_METRICS: Record<PerformanceTabKey, PerformanceMetric[]> = {
  order_management: [
    {
      id: 1,
      criteria: 'Tỉ lệ đơn không thành công',
      shopValue: null,
      targetLabel: '<10.00%',
      isPassing: null,
    },
    {
      id: 2,
      criteria: 'Tỷ lệ giao hàng trễ',
      shopValue: null,
      targetLabel: '<10.00%',
      isPassing: null,
    },
    {
      id: 3,
      criteria: 'Thời gian chuẩn bị hàng',
      shopValue: null,
      targetLabel: '<1.50 days',
      isPassing: null,
    },
  ],
  listing_violation: [
    { id: 4, criteria: 'Số sản phẩm vi phạm', shopValue: 0, targetLabel: '0', isPassing: true },
    {
      id: 5,
      criteria: 'Tỷ lệ sản phẩm bị hạn chế',
      shopValue: null,
      targetLabel: '<5.00%',
      isPassing: null,
    },
  ],
  customer_service: [
    {
      id: 6,
      criteria: 'Tỷ lệ phản hồi chat',
      shopValue: null,
      targetLabel: '>75.00%',
      isPassing: null,
    },
    {
      id: 7,
      criteria: 'Thời gian phản hồi chat',
      shopValue: null,
      targetLabel: '<12 hours',
      isPassing: null,
    },
  ],
};
