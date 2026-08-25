import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderTabs, OrderSearchBar, OrderCard, OrderEmptyState } from '@/components';
import { useGetOrdersByUser, useGetMultipleAssets, type GetOrdersByUserResponse } from '@/hooks';
import type { OrderStatus, OrderTabKey, Order } from '@/types';

const TAB_STATUS_MAP: Record<OrderTabKey, OrderStatus[] | null> = {
  pending_payment: ['pending_payment'],
  all: null,
  shipping: ['shipping'],
  completed: ['completed'],
  cancelled: ['cancelled'],
  return_refund: ['return_refund'],
};

const EMPTY_MESSAGE: Record<OrderTabKey, string> = {
  all: 'Chưa có đơn hàng',
  pending_payment: 'Chưa có đơn hàng',
  shipping: 'Chưa có đơn hàng',
  completed: 'Chưa có đơn hàng',
  cancelled: 'Chưa có đơn hàng',
  return_refund: 'Bạn hiện không có yêu cầu Trả hàng/Hoàn tiền nào',
};

const PAGE_SIZE = 10;

const API_STATUS_MAP: Record<string, OrderStatus> = {
  PendingPayment: 'pending_payment',
  Shipping: 'shipping',
  Completed: 'completed',
  Cancelled: 'cancelled',
  ReturnRefund: 'return_refund',
};

function mapApiOrderToOrder(apiOrder: GetOrdersByUserResponse[number]): Order {
  return {
    id: apiOrder.id,
    shop: {
      id: apiOrder.shopId,
      name: apiOrder.shopName,
      avatarText: apiOrder.shopName.charAt(0).toUpperCase(),
      isFavorite: false,
    },
    status: API_STATUS_MAP[apiOrder.status] ?? 'pending_payment',
    items: apiOrder.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      thumbnail: item.thumbnail,
      variation: item.variation ?? '',
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice ?? undefined,
    })),
    totalAmount: apiOrder.totalPayment,
    createdAt: apiOrder.createdAt,
    note: apiOrder.note ?? undefined,
    merchandiseSubtotal: apiOrder.merchandiseSubtotal,
    shippingFee: apiOrder.shippingFee,
    totalDiscount: apiOrder.totalDiscount,
    xuDiscount: apiOrder.xuDiscount,
  };
}

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function SkeletonOrderCard() {
  return (
    <div className='mb-3 animate-pulse border border-slate-100 bg-white'>
      <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
        <div className='h-4 w-32 rounded bg-slate-200' />
        <div className='h-4 w-20 rounded bg-slate-200' />
      </div>
      <div className='space-y-3 px-4 py-3'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <div className='h-16 w-16 shrink-0 rounded bg-slate-200' />
            <div className='flex-1 space-y-2'>
              <div className='h-4 w-3/4 rounded bg-slate-200' />
              <div className='h-4 w-1/3 rounded bg-slate-200' />
            </div>
          </div>
        ))}
      </div>
      <div className='flex justify-end px-4 py-3'>
        <div className='h-5 w-28 rounded bg-slate-200' />
      </div>
      <div className='flex justify-end gap-2 border-t border-slate-100 px-4 py-3'>
        <div className='h-9 w-28 rounded bg-slate-200' />
        <div className='h-9 w-28 rounded bg-slate-200' />
      </div>
    </div>
  );
}

export default function Purchase() {
  const { status } = useParams<{ status?: string }>();
  const navigate = useNavigate();
  const activeTab = (status as OrderTabKey) || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, isPending, errorMessage } = useGetOrdersByUser();

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!data) return;
    const mapped = data
      .map(mapApiOrderToOrder)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(mapped);
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  const tabFilteredOrders = useMemo(() => {
    const allowedStatuses = TAB_STATUS_MAP[activeTab];
    if (!allowedStatuses) return orders;
    return orders.filter((order) => allowedStatuses.includes(order.status));
  }, [orders, activeTab]);

  const filteredOrders = useMemo(() => {
    const term = normalize(searchTerm);
    if (!term) return tabFilteredOrders;
    return tabFilteredOrders.filter((order) => {
      if (normalize(order.id).includes(term)) return true;
      if (normalize(order.shop.name).includes(term)) return true;
      return order.items.some((item) => normalize(item.productName).includes(term));
    });
  }, [tabFilteredOrders, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const assetIds = useMemo(() => {
    const ids = new Set<string>();
    pagedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.thumbnail) ids.add(item.thumbnail);
      });
    });
    return Array.from(ids);
  }, [pagedOrders]);

  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets({ assetIds });

  const assetUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    assetsData?.items.forEach((entry) => {
      if (entry.found) map[entry.id] = entry.asset.publicUrl;
    });
    return map;
  }, [assetsData]);

  const handleTabChange = (tab: OrderTabKey) => {
    navigate(`/user/purchase/${tab}`);
  };

  const handleMarkReceived = (orderId: string) => {
    // TODO: khi có API -> POST /order/{id}/confirm-received, gọi lại refetch thay vì set state cục bộ
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o)));
  };

  const handleCancelOrder = (orderId: string) => {
    // TODO: khi có API -> POST /order/{id}/cancel, gọi lại refetch thay vì set state cục bộ
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
  };

  const handleWriteReview = (orderId: string) => navigate(`/user/purchase/${orderId}/review`);

  const isSearching = searchTerm.trim() !== '';

  return (
    <div className='border border-slate-100 bg-white'>
      <OrderTabs activeTab={activeTab} onChange={handleTabChange} />
      {activeTab === 'all' && <OrderSearchBar value={searchTerm} onChange={setSearchTerm} />}

      <div className='p-4'>
        {errorMessage && <p className='mb-3 text-sm text-red-500'>{errorMessage}</p>}

        {isPending ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonOrderCard key={i} />)
        ) : filteredOrders.length === 0 ? (
          <OrderEmptyState
            message={isSearching ? 'Không tìm thấy đơn hàng phù hợp' : EMPTY_MESSAGE[activeTab]}
          />
        ) : (
          <>
            {pagedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                assetUrlMap={assetUrlMap}
                isAssetsPending={isAssetsPending}
                onMarkReceived={handleMarkReceived}
                onCancel={handleCancelOrder}
                onWriteReview={handleWriteReview}
              />
            ))}

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
  );
}
