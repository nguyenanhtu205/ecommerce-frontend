import { useMemo, useState } from 'react';
import { SellerBreadcrumb } from '@/components';
import {
  useGetRevenueForSeller,
  useGetUsersForChat,
  type PaidOrderItem,
  type UnpaidOrderItem,
} from '@/hooks';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { GoDownload } from 'react-icons/go';
import { Link } from 'react-router-dom';

type PayoutTab = 'unpaid' | 'paid';

const TABS: { key: PayoutTab; label: string }[] = [
  { key: 'unpaid', label: 'Chưa thanh toán' },
  { key: 'paid', label: 'Đã thanh toán' },
];

type IncomeReport = {
  id: string;
  rangeLabel: string;
};

// TODO: thay bằng dữ liệu thật khi có API báo cáo thu nhập theo tuần/kỳ (hook hiện chưa trả về)
const MOCK_INCOME_REPORTS: IncomeReport[] = [
  { id: '1', rangeLabel: '20 Th05 - 26 Th05 2024' },
  { id: '2', rangeLabel: '13 Th05 - 19 Th05 2024' },
  { id: '3', rangeLabel: '6 Th05 - 12 Th05 2024' },
];

function getPaymentMethodLabel(method: number): string {
  const map: Record<number, string> = {
    0: 'Thanh toán khi nhận hàng (COD)',
    1: 'VNPay',
  };
  return map[method] ?? `Phương thức #${method}`;
}

function getStatusLabel(tab: PayoutTab): string {
  return tab === 'paid' ? 'Thanh toán đã chuyển thành công' : 'Đang chờ đối soát';
}

function formatCurrency(value: number) {
  return '₫' + Math.abs(value).toLocaleString('vi-VN');
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN');
}

function toStartOfDayVN(dateStr: string) {
  return new Date(`${dateStr}T00:00:00+07:00`).toISOString();
}

function toEndOfDayVN(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999+07:00`).toISOString();
}

function OverviewSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <div className='space-y-2'>
        <div className='h-3 w-24 animate-pulse bg-slate-200' />
        <div className='h-7 w-40 animate-pulse bg-slate-200' />
      </div>
      <div className='space-y-2'>
        <div className='h-3 w-24 animate-pulse bg-slate-200' />
        <div className='h-7 w-40 animate-pulse bg-slate-200' />
      </div>
    </div>
  );
}

function OrderRowSkeleton() {
  return (
    <tr>
      <td className='py-3'>
        <div className='flex items-center gap-3'>
          <div className='h-12 w-12 animate-pulse bg-slate-200' />
          <div className='space-y-2'>
            <div className='h-3 w-32 animate-pulse bg-slate-200' />
            <div className='h-3 w-20 animate-pulse bg-slate-200' />
          </div>
        </div>
      </td>
      <td className='py-3'>
        <div className='h-3 w-20 animate-pulse bg-slate-200' />
      </td>
      <td className='py-3'>
        <div className='h-3 w-28 animate-pulse bg-slate-200' />
      </td>
      <td className='py-3'>
        <div className='h-3 w-24 animate-pulse bg-slate-200' />
      </td>
      <td className='py-3'>
        <div className='h-3 w-16 animate-pulse bg-slate-200' />
      </td>
    </tr>
  );
}

export default function Revenue() {
  const [activeTab, setActiveTab] = useState<PayoutTab>('paid');
  const [searchTerm, setSearchTerm] = useState('');

  const [paidFromInput, setPaidFromInput] = useState<string>('');
  const [paidToInput, setPaidToInput] = useState<string>('');

  const paidFrom = paidFromInput ? toStartOfDayVN(paidFromInput) : undefined;
  const paidTo = paidToInput ? toEndOfDayVN(paidToInput) : undefined;

  const { data, isPending, errorMessage } = useGetRevenueForSeller({ paidFrom, paidTo });

  const overview = data?.overview;

  const unpaidOrders = useMemo<UnpaidOrderItem[]>(() => {
    const list = data?.unpaidOrders ?? [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.trim().toLowerCase();
    return list.filter((o) => o.orderId.toLowerCase().includes(term));
  }, [data?.unpaidOrders, searchTerm]);

  const paidOrders = useMemo<PaidOrderItem[]>(() => {
    const list = data?.paidOrders ?? [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.trim().toLowerCase();
    return list.filter((o) => o.orderId.toLowerCase().includes(term));
  }, [data?.paidOrders, searchTerm]);

  const orders = activeTab === 'paid' ? paidOrders : unpaidOrders;

  const buyerIds = useMemo(() => {
    const ids = new Set<string>();
    (data?.unpaidOrders ?? []).forEach((o) => ids.add(o.buyerId));
    (data?.paidOrders ?? []).forEach((o) => ids.add(o.buyerId));
    return Array.from(ids);
  }, [data?.unpaidOrders, data?.paidOrders]);

  const { data: usersData, isPending: isUsersPending } = useGetUsersForChat({ userIds: buyerIds });

  const buyerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    usersData?.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [usersData]);

  function getBuyerName(buyerId: string): string {
    return buyerNameMap.get(buyerId) ?? 'Người dùng không xác định';
  }

  return (
    <div>
      <SellerBreadcrumb items={[{ label: 'Trang Chủ', path: '/seller' }, { label: 'Doanh Thu' }]} />

      <div className='mb-3 bg-white px-6 py-4'>
        <h1 className='mb-4 text-base font-medium text-slate-800'>Tổng Quan</h1>

        <div className='mb-4 flex items-start gap-2 border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-slate-600'>
          <span>ⓘ</span>
          <span>
            Các số dưới đây chưa bao gồm điều chỉnh. Vui lòng tải xuống Báo cáo thu nhập để kiểm tra
            chi tiết các điều chỉnh liên quan.
          </span>
        </div>

        {errorMessage && (
          <div className='mb-4 border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600'>
            {errorMessage}
          </div>
        )}

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]'>
          {isPending || !overview ? (
            <OverviewSkeleton />
          ) : (
            <div className='grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr]'>
              {/* Chưa thanh toán */}
              <div>
                <div className='mb-1 flex items-center gap-1 text-sm text-[#EE4D2D]'>
                  Chưa thanh toán
                </div>
                <div className='mb-3 text-xs text-slate-400'>Tổng cộng</div>
                <div className='text-2xl font-medium text-slate-800'>
                  {formatCurrency(overview.pendingBalance)}
                </div>
                {overview.debtBalance !== 0 && (
                  <div className='mt-2 text-xs text-red-500'>
                    Công nợ: {formatCurrency(overview.debtBalance)}
                  </div>
                )}
              </div>

              {/* Đã thanh toán */}
              <div>
                <div className='mb-1 flex items-center gap-1 text-sm text-[#EE4D2D]'>
                  Đã thanh toán
                </div>
                <div className='grid grid-cols-3 gap-3'>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>Tuần này</div>
                    <div className='text-base font-medium text-slate-800 xl:text-lg'>
                      {formatCurrency(overview.paidThisWeek)}
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>Tháng này</div>
                    <div className='text-base font-medium text-slate-800 xl:text-lg'>
                      {formatCurrency(overview.paidThisMonth)}
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-xs text-slate-400'>Tổng cộng</div>
                    <div className='text-base font-medium text-slate-800 xl:text-lg'>
                      {formatCurrency(overview.paidTotal)}
                    </div>
                  </div>
                </div>
                <div className='mt-3 text-xs text-slate-500'>Tài khoản Ngân hàng của tôi: ****</div>
                <Link
                  to={'/seller/finance/balance'}
                  className='mt-1 inline-block cursor-pointer text-xs text-blue-600 hover:underline'
                >
                  Số dư TK Shopee ›
                </Link>
              </div>
            </div>
          )}

          {/* Báo cáo thu nhập (Cố định lệch sang phải) */}
          <div className='border-t border-slate-100 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8'>
            <div className='mb-3 flex items-center justify-between'>
              <h2 className='text-sm font-medium text-slate-800'>Báo cáo thu nhập</h2>
              <button className='cursor-pointer text-xs text-blue-600 hover:underline'>
                Xem thêm ›
              </button>
            </div>
            {isPending ? (
              <div className='space-y-3'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='h-3 w-40 animate-pulse bg-slate-200' />
                ))}
              </div>
            ) : (
              <div className='space-y-3'>
                {MOCK_INCOME_REPORTS.map((report) => (
                  <div key={report.id} className='flex items-center justify-between text-sm'>
                    <span className='text-slate-600'>{report.rangeLabel}</span>
                    <button
                      title='Tải xuống'
                      className='mr-7 cursor-pointer text-slate-400 hover:text-slate-700'
                    >
                      <GoDownload />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='mb-6 bg-white'>
        <div className='px-6 pt-4'>
          <h2 className='mb-3 text-base font-medium text-slate-800'>Chi Tiết</h2>
          <div className='flex gap-6 border-b border-slate-200'>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer border-b-2 py-3 text-sm ${
                  activeTab === tab.key
                    ? 'border-[#EE4D2D] font-medium text-[#EE4D2D]'
                    : 'border-transparent text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3 px-6 py-4'>
          <div className='flex items-center gap-2 border border-slate-200 px-3 py-1.5 text-sm text-slate-600'>
            <IoCalendarClearOutline className='shrink-0 text-slate-400' />
            <input
              type='date'
              value={paidFromInput}
              onChange={(e) => setPaidFromInput(e.target.value)}
              max={paidToInput || undefined}
              className='cursor-pointer bg-transparent text-sm text-slate-600 outline-none'
            />
            <span className='text-slate-400'>-</span>
            <input
              type='date'
              value={paidToInput}
              onChange={(e) => setPaidToInput(e.target.value)}
              min={paidFromInput || undefined}
              className='cursor-pointer bg-transparent text-sm text-slate-600 outline-none'
            />
          </div>
          <div className='flex items-center gap-3'>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Tìm kiếm đơn hàng'
              className='w-56 border border-slate-200 px-3 py-1.5 text-sm'
            />
            <button className='cursor-pointer border border-slate-200 px-3 py-1.5 text-sm text-slate-600'>
              Xuất
            </button>
          </div>
        </div>

        <div className='overflow-x-auto px-6 pb-4'>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-b border-slate-100 text-xs text-slate-400'>
                <th className='py-2 font-normal'>Mã Đơn Hàng</th>
                <th className='py-2 font-normal'>
                  {activeTab === 'paid' ? 'Thanh Toán Đã Chuyển Vào' : 'Dự Kiến Giải Ngân'}
                </th>
                <th className='py-2 font-normal'>Trạng Thái</th>
                <th className='py-2 font-normal'>Phương Thức Thanh Toán</th>
                <th className='py-2 font-normal'>Số Tiền Thanh Toán</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {isPending ? (
                Array.from({ length: 3 }).map((_, i) => <OrderRowSkeleton key={i} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className='py-10 text-center text-sm text-slate-400'>
                    {activeTab === 'unpaid'
                      ? 'Không có đơn hàng chưa thanh toán.'
                      : 'Không tìm thấy đơn hàng nào.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isPaid = activeTab === 'paid';
                  const paidOrder = order as PaidOrderItem;
                  const unpaidOrder = order as UnpaidOrderItem;

                  return (
                    <tr key={order.orderId} className='align-top'>
                      <td className='py-3'>
                        <div className='flex items-center gap-3'>
                          <div>
                            <Link
                              to={'/seller/orders/all'}
                              className='cursor-pointer text-blue-600 hover:underline'
                            >
                              {order.orderId}
                            </Link>
                            <div className='text-xs text-slate-400'>
                              Người mua:{' '}
                              {isUsersPending ? (
                                <span className='inline-block h-3 w-16 animate-pulse bg-slate-200 align-middle' />
                              ) : (
                                getBuyerName(order.buyerId)
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='py-3 text-slate-600'>
                        {formatDate(isPaid ? paidOrder.paidAt : unpaidOrder.releaseDueAt)}
                      </td>
                      <td className='py-3 text-slate-600'>{getStatusLabel(activeTab)}</td>
                      <td className='py-3 text-slate-600'>
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </td>
                      <td className='py-3'>
                        <div className='text-slate-800'>{formatCurrency(order.amount)}</div>
                        {isPaid && paidOrder.refundedAmount > 0 && (
                          <div className='text-xs text-red-500'>
                            Đã hoàn: {formatCurrency(paidOrder.refundedAmount)}
                          </div>
                        )}
                        <button className='cursor-pointer text-xs text-blue-600 hover:underline'>
                          Điều chỉnh
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
