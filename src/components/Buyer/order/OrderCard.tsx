import OrderItemRow from './OrderItemRow';
import { useChatWindowStore } from '@/stores';
import type { Order, OrderStatus } from '@/types';
import { Link } from 'react-router-dom';

type OrderCardProps = {
  order: Order;
  assetUrlMap: Record<string, string>;
  isAssetsPending: boolean;
  onMarkReceived: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  onWriteReview: (orderId: string) => void;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'CHỜ THANH TOÁN',
  shipping: 'ĐANG VẬN CHUYỂN',
  completed: 'HOÀN THÀNH',
  cancelled: 'ĐÃ HỦY',
  return_refund: 'TRẢ HÀNG/HOÀN TIỀN',
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso),
  );
}

export default function OrderCard({
  order,
  assetUrlMap,
  isAssetsPending,
  onMarkReceived,
  onCancel,
  onWriteReview,
}: OrderCardProps) {
  const startConversationWithShop = useChatWindowStore((state) => state.startConversationWithShop);

  return (
    <div className='mb-3 border border-slate-100 bg-white'>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3'>
        <div className='flex items-center gap-3'>
          {order.shop.isFavorite && (
            <span className='bg-[#EE4D2D] px-1.5 py-0.5 text-[10px] font-bold text-white'>
              Yêu thích
            </span>
          )}
          <span className='text-sm font-medium text-slate-800'>{order.shop.name}</span>
          <button
            onClick={() => startConversationWithShop(order.shop.id)}
            className='cursor-pointer border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50'
          >
            Chat
          </button>
          <Link
            to={`/shop/${order.shop.id}`}
            className='cursor-pointer border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50'
          >
            Xem Shop
          </Link>
        </div>
        <span className='text-sm font-medium text-[#EE4D2D]'>{STATUS_LABEL[order.status]}</span>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-1 px-4 pt-2 text-xs text-slate-400'>
        <span>Mã đơn hàng: {order.id}</span>
        <span>Ngày đặt: {formatDate(order.createdAt)}</span>
      </div>

      <div className='divide-y divide-slate-100 px-4'>
        {order.items.map((item) => (
          <OrderItemRow
            key={item.id}
            item={item}
            imageUrl={assetUrlMap[item.thumbnail]}
            isImageLoading={isAssetsPending && !assetUrlMap[item.thumbnail]}
          />
        ))}
      </div>

      {order.note && (
        <div className='px-4 py-2 text-sm text-slate-500'>
          Lời nhắn: <span className='text-slate-700'>{order.note}</span>
        </div>
      )}

      <div className='space-y-1.5 border-t border-slate-100 px-4 py-3'>
        <div className='flex justify-end gap-16 text-sm'>
          <span className='text-slate-500'>Tổng tiền hàng</span>
          <span className='w-28 text-right text-slate-700'>
            {formatPrice(order.merchandiseSubtotal)}
          </span>
        </div>
        <div className='flex justify-end gap-16 text-sm'>
          <span className='text-slate-500'>Phí vận chuyển</span>
          <span className='w-28 text-right text-slate-700'>{formatPrice(order.shippingFee)}</span>
        </div>
        {order.totalDiscount > 0 && (
          <div className='flex justify-end gap-16 text-sm'>
            <span className='text-slate-500'>Giảm giá voucher</span>
            <span className='w-28 text-right text-slate-700'>
              -{formatPrice(order.totalDiscount)}
            </span>
          </div>
        )}
        {order.xuDiscount > 0 && (
          <div className='flex justify-end gap-16 text-sm'>
            <span className='text-slate-500'>Giảm giá Xu</span>
            <span className='w-28 text-right text-slate-700'>-{formatPrice(order.xuDiscount)}</span>
          </div>
        )}
        <div className='flex justify-end gap-16 text-sm'>
          <span className='text-slate-700'>Thành tiền</span>
          <span className='w-28 text-right text-lg font-medium text-[#EE4D2D]'>
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      <div className='flex justify-end gap-2 border-t border-slate-100 px-4 py-3'>
        {order.status === 'pending_payment' && (
          <>
            <button
              onClick={() => onCancel(order.id)}
              className='cursor-pointer border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
            >
              Huỷ Đơn Hàng
            </button>
            <button className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'>
              Thanh Toán Ngay
            </button>
          </>
        )}

        {order.status === 'shipping' && (
          <>
            <button
              onClick={() => startConversationWithShop(order.shop.id)}
              className='cursor-pointer border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
            >
              Liên Hệ Người Bán
            </button>
            <button
              onClick={() => onMarkReceived(order.id)}
              className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'
            >
              Đã Nhận Được Hàng
            </button>
          </>
        )}

        {order.status === 'completed' && (
          <>
            <button
              onClick={() => startConversationWithShop(order.shop.id)}
              className='cursor-pointer border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
            >
              Liên Hệ Người Bán
            </button>
            <button
              onClick={() => onWriteReview(order.id)}
              className='cursor-pointer border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
            >
              Đánh Giá
            </button>
            <Link
              to={`/product/${order.items[0].productId}`}
              className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'
            >
              Mua Lại
            </Link>
          </>
        )}

        {order.status === 'cancelled' && (
          <Link
            to={`/product/${order.items[0].productId}`}
            className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'
          >
            Mua Lại
          </Link>
        )}

        {order.status === 'return_refund' && (
          <button
            onClick={() => startConversationWithShop(order.shop.id)}
            className='cursor-pointer border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
          >
            Liên Hệ Người Bán
          </button>
        )}
      </div>
    </div>
  );
}
