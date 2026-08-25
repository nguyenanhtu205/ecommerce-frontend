import { useState } from 'react';
import { Landmark, Plus } from 'lucide-react';

export default function Payment() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className='mt-4 bg-white shadow-sm'>
        <section>
          <div className='flex items-center justify-between border-b border-slate-100 px-6 py-5'>
            <h2 className='text-lg font-medium text-slate-800'>Ví điện tử</h2>

            <button
              onClick={() => setOpen(true)}
              className='flex h-10 cursor-pointer items-center gap-2 bg-[#EE4D2D] px-4 text-sm text-white hover:bg-[#d8431f]'
            >
              <Plus size={16} />
              Liên kết ví
            </button>
          </div>

          <div className='flex h-65 flex-col items-center justify-center'>
            <Landmark size={58} strokeWidth={1.5} className='text-slate-300' />

            <p className='mt-4 text-base text-slate-600'>Bạn chưa liên kết ví điện tử.</p>
          </div>
        </section>
      </div>

      <PaymentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
};

type Wallet = 'momo' | 'zalopay' | 'vnpay' | '';

function PaymentModal({ open, onClose }: Props) {
  const [wallet, setWallet] = useState<Wallet>('');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [bank, setBank] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  if (!open) return null;

  const isValid = (() => {
    switch (wallet) {
      case 'momo':
      case 'zalopay':
        return phone.trim() !== '' && otp.trim() !== '';

      case 'vnpay':
        return bank.trim() !== '' && accountName.trim() !== '' && accountNumber.trim() !== '';

      default:
        return false;
    }
  })();

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
      onClick={onClose}
    >
      <div className='w-full max-w-125 bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className='border-b border-slate-100 px-6 py-5'>
          <h2 className='text-lg font-medium text-slate-800'>Liên kết ví điện tử</h2>
        </div>

        <div className='space-y-4 p-6'>
          {/* Chọn ví */}
          <div>
            <label className='mb-2 block text-sm text-slate-600'>Chọn ví</label>

            <div className='relative'>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value as Wallet)}
                className='h-10 w-full appearance-none border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              >
                <option value=''>Chọn ví</option>
                <option value='momo'>MoMo</option>
                <option value='zalopay'>ZaloPay</option>
                <option value='vnpay'>VNPay</option>
              </select>

              <svg
                className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
          </div>

          {/* MoMo */}
          {wallet === 'momo' && (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='Số điện thoại MoMo'
                className='h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              />

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder='Mã OTP'
                className='h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              />
            </>
          )}

          {/* ZaloPay */}
          {wallet === 'zalopay' && (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='Số điện thoại ZaloPay'
                className='h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              />

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder='Mã OTP'
                className='h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              />
            </>
          )}

          {/* VNPay */}
          {wallet === 'vnpay' && (
            <>
              <div className='relative'>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className='h-10 w-full appearance-none border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
                >
                  <option>Chọn ngân hàng</option>
                  <option>Vietcombank</option>
                  <option>BIDV</option>
                  <option>Techcombank</option>
                  <option>MB Bank</option>
                  <option>ACB</option>
                </select>
                <svg
                  className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>

              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder='Tên chủ tài khoản'
                className='h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              />

              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder='Số tài khoản'
                className='h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              />
            </>
          )}

          {/* footer */}
          <div className='flex justify-end gap-3 pt-2'>
            <button
              onClick={onClose}
              className='h-10 cursor-pointer px-6 text-sm text-slate-600 hover:bg-gray-100'
            >
              Hủy
            </button>

            <button
              disabled={!isValid}
              className='h-10 cursor-pointer bg-[#EE4D2D] px-8 text-sm text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:bg-orange-300'
            >
              Liên kết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
