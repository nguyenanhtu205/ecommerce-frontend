import type { ShopPaymentSettings, PayoutCycle } from '@/types';

type PaymentSettingsSectionProps = {
  data: ShopPaymentSettings;
};

const PAYOUT_CYCLE_LABEL: Record<PayoutCycle, string> = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  biweekly: 'Hai tuần một lần',
};

export default function PaymentSettingsSection({ data }: PaymentSettingsSectionProps) {
  return (
    <div className='space-y-3'>
      <div className='bg-white p-6 shadow-sm'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-base font-medium text-slate-800'>Tài Khoản Ngân Hàng</h2>
          <button className='cursor-pointer border border-[#EE4D2D] px-4 py-1.5 text-sm text-[#EE4D2D] hover:bg-[#FFF4F1]'>
            + Thêm Tài Khoản
          </button>
        </div>

        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-slate-100 text-left text-slate-400'>
              <th className='py-2 font-normal'>Ngân hàng</th>
              <th className='py-2 font-normal'>Số tài khoản</th>
              <th className='py-2 font-normal'>Chủ tài khoản</th>
              <th className='py-2 font-normal'>Trạng thái</th>
              <th className='py-2 text-right font-normal'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.bankAccounts.map((acc) => (
              <tr key={acc.id} className='border-b border-slate-50'>
                <td className='py-3 text-slate-700'>{acc.bankName}</td>
                <td className='py-3 text-slate-700'>{acc.accountNumber}</td>
                <td className='py-3 text-slate-700'>{acc.accountHolder}</td>
                <td className='py-3'>
                  <span className={acc.isVerified ? 'text-emerald-600' : 'text-amber-500'}>
                    {acc.isVerified ? 'Đã xác thực' : 'Chờ xác thực'}
                  </span>
                  {acc.isDefault && <span className='ml-2 text-xs text-slate-400'>(Mặc định)</span>}
                </td>
                <td className='py-3 text-right'>
                  <button className='cursor-pointer text-sky-600 hover:underline'>Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-base font-medium text-slate-800'>Chu Kỳ Thanh Toán</h2>
        <select
          defaultValue={data.payoutCycle}
          className='w-64 cursor-pointer border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#EE4D2D]'
        >
          {(Object.keys(PAYOUT_CYCLE_LABEL) as PayoutCycle[]).map((cycle) => (
            <option key={cycle} value={cycle}>
              {PAYOUT_CYCLE_LABEL[cycle]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
