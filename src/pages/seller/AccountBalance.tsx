import { useMemo, useState } from 'react';
import { SellerBreadcrumb } from '@/components';
import { BsBank } from 'react-icons/bs';
import { useGetAccountBalance, WalletTransactionType, type WalletTransactionItem } from '@/hooks';
import { Link } from 'react-router-dom';
import { IoIosInformationCircleOutline } from 'react-icons/io';

type FlowFilter = 'all' | 'in' | 'out';

type TransactionTypeFilterKey =
  'order_revenue' | 'debt' | 'offset' | 'refund_recorded' | 'withdraw';

const TRANSACTION_TYPE_OPTIONS: { key: TransactionTypeFilterKey; label: string }[] = [
  { key: 'order_revenue', label: 'Doanh Thu Đơn Hàng' },
  { key: 'debt', label: 'Công nợ' },
  { key: 'offset', label: 'Cấn trừ Số dư TK Shopee' },
  { key: 'refund_recorded', label: 'Giá trị hoàn được ghi nhận' },
  { key: 'withdraw', label: 'Rút Tiền' },
];

const FILTER_KEY_TO_ENUM: Record<TransactionTypeFilterKey, WalletTransactionType> = {
  order_revenue: WalletTransactionType.EscrowRelease,
  withdraw: WalletTransactionType.Withdrawal,
  refund_recorded: WalletTransactionType.RefundDeduction,
  offset: WalletTransactionType.DebtSettlement,
  debt: WalletTransactionType.DebtIncrease,
};

function getTransactionTypeLabel(type: WalletTransactionType): string {
  switch (type) {
    case WalletTransactionType.EscrowRelease:
      return 'Doanh Thu Đơn Hàng';
    case WalletTransactionType.Withdrawal:
      return 'Rút Tiền';
    case WalletTransactionType.RefundDeduction:
      return 'Giá trị hoàn được ghi nhận';
    case WalletTransactionType.DebtSettlement:
      return 'Cấn trừ Số dư TK Shopee';
    case WalletTransactionType.DebtIncrease:
      return 'Công nợ tăng';
    default:
      return 'Giao dịch khác';
  }
}

function formatSignedCurrency(value: number) {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${Math.abs(value).toLocaleString('vi-VN')}`;
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

const PAGE_SIZE_OPTIONS = [20, 50, 100];

function OverviewSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='h-3 w-16 animate-pulse bg-slate-200' />
      <div className='h-9 w-48 animate-pulse bg-slate-200' />
      <div className='h-8 w-32 animate-pulse bg-slate-200' />
    </div>
  );
}

function TransactionRowSkeleton() {
  return (
    <tr>
      <td className='py-3'>
        <div className='h-3 w-16 animate-pulse bg-slate-200' />
      </td>
      <td className='py-3'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 shrink-0 animate-pulse bg-slate-200' />
          <div className='space-y-2'>
            <div className='h-3 w-40 animate-pulse bg-slate-200' />
            <div className='h-3 w-56 animate-pulse bg-slate-200' />
          </div>
        </div>
      </td>
      <td className='py-3'>
        <div className='h-3 w-20 animate-pulse bg-slate-200' />
      </td>
      <td className='py-3'>
        <div className='h-3 w-14 animate-pulse bg-slate-200' />
      </td>
      <td className='py-3'>
        <div className='h-3 w-16 animate-pulse bg-slate-200' />
      </td>
      <td className='py-3'>
        <div className='h-3 w-16 animate-pulse bg-slate-200' />
      </td>
    </tr>
  );
}

export default function AccountBalance() {
  const [draftFromInput, setDraftFromInput] = useState('');
  const [draftToInput, setDraftToInput] = useState('');
  const [draftFlowFilter, setDraftFlowFilter] = useState<FlowFilter>('all');
  const [draftSelectedTypes, setDraftSelectedTypes] = useState<TransactionTypeFilterKey[]>([]);

  const [appliedFromInput, setAppliedFromInput] = useState('');
  const [appliedToInput, setAppliedToInput] = useState('');
  const [appliedFlowFilter, setAppliedFlowFilter] = useState<FlowFilter>('all');
  const [appliedSelectedTypes, setAppliedSelectedTypes] = useState<TransactionTypeFilterKey[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  function toggleDraftType(type: TransactionTypeFilterKey) {
    setDraftSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  function resetFilters() {
    setDraftFromInput('');
    setDraftToInput('');
    setDraftFlowFilter('all');
    setDraftSelectedTypes([]);

    setAppliedFromInput('');
    setAppliedToInput('');
    setAppliedFlowFilter('all');
    setAppliedSelectedTypes([]);
    setPage(1);
  }

  function applyFilters() {
    setAppliedFromInput(draftFromInput);
    setAppliedToInput(draftToInput);
    setAppliedFlowFilter(draftFlowFilter);
    setAppliedSelectedTypes(draftSelectedTypes);
    setPage(1);
  }

  const from = appliedFromInput ? toStartOfDayVN(appliedFromInput) : undefined;
  const to = appliedToInput ? toEndOfDayVN(appliedToInput) : undefined;
  const flow = appliedFlowFilter === 'all' ? undefined : appliedFlowFilter;

  const types = useMemo<WalletTransactionType[] | undefined>(() => {
    const mapped = appliedSelectedTypes
      .map((key) => FILTER_KEY_TO_ENUM[key])
      .filter((v): v is WalletTransactionType => v !== undefined);
    return mapped.length > 0 ? mapped : undefined;
  }, [appliedSelectedTypes]);

  const { data, isPending, errorMessage } = useGetAccountBalance({
    from,
    to,
    flow,
    types,
    orderIdSearch: searchTerm.trim() || undefined,
    page,
    pageSize,
  });

  const overview = data?.overview;
  const transactions: WalletTransactionItem[] = data?.transactions ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalAmount = data?.totalAmount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
      <SellerBreadcrumb
        items={[{ label: 'Trang Chủ', path: '/seller' }, { label: 'Số Dư Tài Khoản' }]}
      />

      <div className='mb-3 bg-white px-6 py-4'>
        <h1 className='mb-4 text-base font-medium text-slate-800'>Tổng Quan</h1>

        {errorMessage && (
          <div className='mb-4 border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600'>
            {errorMessage}
          </div>
        )}

        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {isPending || !overview ? (
            <OverviewSkeleton />
          ) : (
            <div>
              <div className='mb-1 flex items-center gap-2 text-sm text-slate-500'>
                <span>Số dư</span>

                <span className='flex items-center gap-1 text-xs text-green-600'>
                  Tự động rút tiền: Bật
                  <span className='group relative cursor-help'>
                    <IoIosInformationCircleOutline />

                    <span className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-md bg-slate-800 px-3 py-2 text-center text-xs font-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
                      Tiền trong ví sẽ tự động chuyển về tài khoản ngân hàng.
                    </span>
                  </span>
                </span>
              </div>
              <div className='mb-3 flex items-center gap-3'>
                <span className='text-3xl font-medium text-slate-800'>
                  {formatSignedCurrency(overview.balance)}
                </span>
                <button className='cursor-pointer bg-[#EE4D2D] px-4 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'>
                  Yêu Cầu Thanh Toán
                </button>
              </div>
              <div className='inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 text-sm text-slate-500'>
                Số dư khả dụng {formatSignedCurrency(overview.availableBalance)}
                <span className='group relative cursor-help'>
                  <IoIosInformationCircleOutline className='text-slate-400' />

                  <span className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-md bg-slate-800 px-3 py-2 text-center text-xs font-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
                    Số dư có thể sử dụng để thực hiện các giao dịch.
                  </span>
                </span>
              </div>
              {overview.debtBalance !== 0 && (
                <div className='mt-2 text-xs text-red-500'>
                  Công nợ: {formatSignedCurrency(overview.debtBalance)}
                </div>
              )}
            </div>
          )}

          <div>
            <div className='mb-3 flex items-center justify-between'>
              <h2 className='text-sm font-medium text-slate-800'>Tài khoản ngân hàng</h2>
              <Link
                to={'/seller/finance/bank-account'}
                className='cursor-pointer text-xs text-blue-600 hover:underline'
              >
                Xem thêm ›
              </Link>
            </div>
            {isPending ? (
              <div className='flex items-center gap-3'>
                <div className='h-9 w-9 animate-pulse bg-slate-200' />
                <div className='space-y-2'>
                  <div className='h-3 w-56 animate-pulse bg-slate-200' />
                  <div className='h-3 w-32 animate-pulse bg-slate-200' />
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-slate-500'>
                  <BsBank />
                </div>
                <div>
                  <div className='flex items-center gap-2 text-sm text-slate-700'>
                    VCB - NH TMCP Ngoại Thương Việt Nam
                    <span className='bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-600'>
                      Mặc định
                    </span>
                    <span className='text-slate-400'>*** 8872</span>
                  </div>
                  <div className='text-xs text-slate-400'>Đã kiểm tra</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='mb-6 bg-white'>
        <div className='px-6 pt-4'>
          <h2 className='text-base font-medium text-slate-800'>Các giao dịch gần đây</h2>
        </div>

        <div className='space-y-4 px-6 py-4 text-sm'>
          <div className='flex items-center gap-4'>
            <span className='w-56 shrink-0 text-slate-500'>Thời gian phát sinh giao dịch</span>
            <div className='flex items-center gap-2 border border-slate-200 px-3 py-1.5 text-slate-600'>
              <input
                type='date'
                value={draftFromInput}
                onChange={(e) => setDraftFromInput(e.target.value)}
                max={draftToInput || undefined}
                className='cursor-pointer bg-transparent text-sm text-slate-600 outline-none'
              />
              <span className='text-slate-400'>-</span>
              <input
                type='date'
                value={draftToInput}
                onChange={(e) => setDraftToInput(e.target.value)}
                min={draftFromInput || undefined}
                className='cursor-pointer bg-transparent text-sm text-slate-600 outline-none'
              />
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <span className='w-56 shrink-0 text-slate-500'>Dòng tiền</span>
            <div className='flex gap-2'>
              {[
                { key: 'all' as const, label: 'Tất cả' },
                { key: 'in' as const, label: 'Tiền vào' },
                { key: 'out' as const, label: 'Tiền ra' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDraftFlowFilter(opt.key)}
                  className={`cursor-pointer border px-3 py-1.5 ${
                    draftFlowFilter === opt.key
                      ? 'border-[#EE4D2D] text-[#EE4D2D]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-start gap-4'>
            <span className='w-56 shrink-0 pt-1 text-slate-500'>Loại giao dịch</span>
            <div className='flex flex-wrap gap-x-6 gap-y-2'>
              {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className='flex cursor-pointer items-center gap-2 text-slate-600'
                >
                  <input
                    type='checkbox'
                    checked={draftSelectedTypes.includes(opt.key)}
                    onChange={() => toggleDraftType(opt.key)}
                    className='cursor-pointer'
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <button
              onClick={resetFilters}
              className='cursor-pointer border border-slate-200 px-4 py-1.5 text-slate-600'
            >
              Thiết lập lại
            </button>
            <button
              onClick={applyFilters}
              className='cursor-pointer bg-[#EE4D2D] px-4 py-1.5 font-medium text-white hover:bg-[#d8431f]'
            >
              Áp dụng
            </button>
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4'>
          <span className='text-sm text-slate-600'>
            {totalCount} giao dịch (Tổng số tiền: {formatSignedCurrency(totalAmount)})
          </span>
          <div className='flex items-center gap-3'>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder='Tìm kiếm đơn hàng'
              className='w-56 border border-slate-200 px-3 py-1.5 text-sm'
            />
            <button className='cursor-pointer border border-slate-200 px-3 py-1.5 text-sm text-slate-600'>
              Xuất
            </button>
          </div>
        </div>

        <div className='overflow-x-auto px-6'>
          <table className='w-full text-left text-sm'>
            <thead>
              <tr className='border-b border-slate-100 text-xs text-slate-400'>
                <th className='py-2 font-normal'>Ngày</th>
                <th className='py-2 font-normal'>Loại Giao Dịch | Mô Tả</th>
                <th className='py-2 font-normal'>Mã Đơn Hàng</th>
                <th className='py-2 font-normal'>Dòng Tiền</th>
                <th className='py-2 font-normal'>Số Tiền</th>
                <th className='py-2 font-normal'>Trạng Thái</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {isPending ? (
                Array.from({ length: 3 }).map((_, i) => <TransactionRowSkeleton key={i} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-10 text-center text-sm text-slate-400'>
                    Không có giao dịch nào.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className='cursor-pointer align-top hover:bg-slate-50'>
                    <td className='py-3 text-slate-600'>{formatDate(tx.createdAt)}</td>
                    <td className='py-3'>
                      <div className='flex items-start gap-3'>
                        <div>
                          <div className='font-medium text-slate-700'>
                            {getTransactionTypeLabel(tx.type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='py-3'>
                      {tx.orderId ? (
                        <Link to={'/seller/orders/all'} className='text-blue-600 hover:underline'>
                          {tx.orderId}
                        </Link>
                      ) : (
                        <span className='text-slate-400'>-</span>
                      )}
                    </td>
                    <td className='py-3 text-slate-600'>
                      {tx.flow === 'in' ? 'Tiền vào' : 'Tiền ra'}
                    </td>
                    <td
                      className={`py-3 font-medium ${
                        tx.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {formatSignedCurrency(tx.amount)}
                    </td>
                    <td className='py-3 text-slate-600'>{tx.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isPending && totalCount > 0 && (
          <div className='flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-3 text-sm'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`cursor-pointer px-2.5 py-1 ${
                  p === page ? 'bg-[#EE4D2D] text-white' : 'border border-slate-200 text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className='cursor-pointer border border-slate-200 px-2 py-1 text-slate-600'
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
