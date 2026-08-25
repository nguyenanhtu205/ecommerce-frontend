import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OrderEmptyState, SellerBreadcrumb } from '@/components';
import {
  useGetOrdersForSeller,
  useGetMultipleAssets,
  type GetOrdersForSellerResponse,
} from '@/hooks';

type SellerOrder = GetOrdersForSellerResponse[number];

const PAGE_SIZE = 10;

const API_STATUS_MAP: Record<string, string> = {
  PendingPayment: 'pending_payment',
  Shipping: 'shipping',
  Completed: 'completed',
  Cancelled: 'cancelled',
  ReturnRefund: 'return_refund',
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Chờ thanh toán',
  shipping: 'Vận chuyển',
  completed: 'Hoàn thành',
  cancelled: 'Đơn hủy',
  return_refund: 'Trả hàng/Hoàn tiền',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending_payment: 'bg-amber-50 text-amber-600',
  shipping: 'bg-blue-50 text-blue-600',
  completed: 'bg-green-50 text-green-600',
  cancelled: 'bg-slate-100 text-slate-500',
  return_refund: 'bg-red-50 text-red-600',
};

const URL_STATUS_MAP: Record<string, string | null> = {
  all: null,
  completed: 'completed',
  shipping: 'shipping',
  pending_payment: 'pending_payment',
  cancelled: 'cancelled',
  'return-refund': 'return_refund',
  return_refund: 'return_refund',
};

const EMPTY_MESSAGE: Record<string, string> = {
  all: 'Chưa có đơn hàng',
  completed: 'Chưa có đơn hàng hoàn thành',
  shipping: 'Chưa có đơn hàng đang vận chuyển',
  pending_payment: 'Chưa có đơn hàng chờ thanh toán',
  cancelled: 'Chưa có đơn hàng bị hủy',
  return_refund: 'Chưa có yêu cầu Trả hàng/Hoàn tiền',
};

const BREADCRUMB_LABEL: Record<string, string> = {
  all: 'Tất cả',
  completed: 'Hoàn thành',
  shipping: 'Vận chuyển',
  pending_payment: 'Chờ thanh toán',
  cancelled: 'Đơn Hủy',
  return_refund: 'Trả Hàng/Hoàn Tiền',
};

function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}

function SkeletonOrderCard() {
  return (
    <div className='mb-3 animate-pulse border border-slate-100 bg-white'>
      <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
        <div className='h-4 w-32 rounded bg-slate-200' />
        <div className='h-4 w-20 rounded bg-slate-200' />
      </div>
      <div className='grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='h-4 w-24 rounded bg-slate-200' />
        ))}
      </div>
      <div className='border-t border-slate-100 px-4 py-3'>
        <div className='h-4 w-20 rounded bg-slate-200' />
      </div>
    </div>
  );
}

export default function OrderList() {
  const { status } = useParams<{ status?: string }>();
  const activeTab = status ?? 'all';
  const allowedStatus = URL_STATUS_MAP[activeTab] ?? null;

  const [page, setPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data, isPending, errorMessage } = useGetOrdersForSeller();

  const orders: SellerOrder[] = useMemo(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data]);

  useEffect(() => {
    setPage(1);
    setExpandedOrderId(null);
  }, [activeTab]);

  const filteredOrders = useMemo(() => {
    if (!allowedStatus) return orders;
    return orders.filter(
      (order) => (API_STATUS_MAP[order.status] ?? order.status) === allowedStatus,
    );
  }, [orders, allowedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const expandedOrder = useMemo(
    () => pagedOrders.find((order) => order.id === expandedOrderId) ?? null,
    [pagedOrders, expandedOrderId],
  );

  const assetIds = useMemo(() => {
    if (!expandedOrder) return [];
    const ids = new Set<string>();
    expandedOrder.items.forEach((item) => {
      if (item.thumbnail) ids.add(item.thumbnail);
    });
    return Array.from(ids);
  }, [expandedOrder]);

  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets({ assetIds });

  const assetUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    assetsData?.items.forEach((entry) => {
      if (entry.found) map[entry.id] = entry.asset.publicUrl;
    });
    return map;
  }, [assetsData]);

  const handleToggle = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <>
      <SellerBreadcrumb
        items={[
          { label: 'Trang Chủ', path: '/seller' },
          { label: 'Đơn Hàng', path: '/seller/orders/all' },
          { label: BREADCRUMB_LABEL[activeTab] ?? BREADCRUMB_LABEL.all },
        ]}
      />
      <div className='border border-slate-100 bg-white'>
        <div className='p-4'>
          {errorMessage && <p className='mb-3 text-sm text-red-500'>{errorMessage}</p>}

          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonOrderCard key={i} />)
          ) : filteredOrders.length === 0 ? (
            <OrderEmptyState message={EMPTY_MESSAGE[activeTab] ?? EMPTY_MESSAGE.all} />
          ) : (
            <>
              {pagedOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const normalizedStatus = API_STATUS_MAP[order.status] ?? order.status;

                return (
                  <div key={order.id} className='mb-3 border border-slate-100 bg-white'>
                    <button
                      type='button'
                      onClick={() => handleToggle(order.id)}
                      className='flex w-full cursor-pointer items-center justify-between border-b border-slate-100 px-4 py-3 text-left'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-medium text-slate-700'>Đơn #{order.id}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium ${
                            STATUS_BADGE_CLASS[normalizedStatus] ?? 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {STATUS_LABEL[normalizedStatus] ?? order.status}
                        </span>
                      </div>
                      <span className='text-xs text-slate-400'>{formatDate(order.createdAt)}</span>
                    </button>

                    <div className='grid grid-cols-2 gap-2 px-4 py-3 text-sm text-slate-600 sm:grid-cols-3'>
                      <div>
                        Tạm tính:{' '}
                        <span className='text-slate-800'>
                          {formatCurrency(order.merchandiseSubtotal)}
                        </span>
                      </div>
                      <div>
                        Phí ship:{' '}
                        <span className='text-slate-800'>{formatCurrency(order.shippingFee)}</span>
                      </div>
                      <div>
                        Giảm giá:{' '}
                        <span className='text-slate-800'>
                          {formatCurrency(order.totalDiscount)}
                        </span>
                      </div>
                      <div>
                        Xu giảm:{' '}
                        <span className='text-slate-800'>{formatCurrency(order.xuDiscount)}</span>
                      </div>
                      <div>
                        Cập nhật:{' '}
                        <span className='text-slate-800'>{formatDate(order.updatedAt)}</span>
                      </div>
                      <div className='font-medium'>
                        Tổng thanh toán:{' '}
                        <span className='text-orange-600'>
                          {formatCurrency(order.totalPayment)}
                        </span>
                      </div>
                    </div>

                    {order.note && (
                      <div className='px-4 pb-3 text-sm text-slate-500'>Ghi chú: {order.note}</div>
                    )}

                    {isExpanded && (
                      <div className='space-y-3 border-t border-slate-100 px-4 py-3'>
                        {order.items.map((item) =>
                          isAssetsPending ? (
                            <div key={item.id} className='flex animate-pulse items-center gap-4'>
                              <div className='h-16 w-16 shrink-0 rounded bg-slate-200' />
                              <div className='flex-1 space-y-2'>
                                <div className='h-4 w-3/4 rounded bg-slate-200' />
                                <div className='h-4 w-1/3 rounded bg-slate-200' />
                              </div>
                            </div>
                          ) : (
                            <div key={item.id} className='flex items-center gap-4'>
                              <img
                                src={assetUrlMap[item.thumbnail] ?? item.thumbnail}
                                alt={item.productName}
                                className='h-16 w-16 shrink-0 rounded object-cover'
                              />
                              <div className='flex-1'>
                                <p className='text-sm text-slate-700'>{item.productName}</p>
                                {item.variation && (
                                  <p className='text-xs text-slate-400'>
                                    Phân loại: {item.variation}
                                  </p>
                                )}
                                <p className='text-xs text-slate-400'>x{item.quantity}</p>
                              </div>
                              <div className='text-right text-sm'>
                                <p className='text-slate-800'>{formatCurrency(item.price)}</p>
                                {item.originalPrice != null &&
                                  item.originalPrice !== item.price && (
                                    <p className='text-xs text-slate-400 line-through'>
                                      {formatCurrency(item.originalPrice)}
                                    </p>
                                  )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    <button
                      type='button'
                      onClick={() => handleToggle(order.id)}
                      className='w-full cursor-pointer border-t border-slate-100 py-2 text-center text-xs text-slate-400 hover:bg-slate-50'
                    >
                      {isExpanded ? 'Thu gọn ▲' : 'Xem chi tiết sản phẩm ▼'}
                    </button>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className='mt-4 flex items-center justify-center gap-3'>
                  <button
                    type='button'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='cursor-pointer border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    Trước
                  </button>
                  <span className='text-sm text-slate-500'>
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    type='button'
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className='cursor-pointer border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
