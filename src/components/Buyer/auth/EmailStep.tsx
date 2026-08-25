import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useRequestOtp, useStartGoogleAuth } from '@/hooks';

type EmailStepProps = {
  onNext: (email: string) => void;
  isSeller?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailStep({ onNext, isSeller = false }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const { startGoogleAuth, isPending: isGooglePending } = useStartGoogleAuth();

  const { requestOtp, isPending, errorMessage } = useRequestOtp();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Email không hợp lệ');
      return;
    }

    setError('');

    const trimmedEmail = email.trim();

    requestOtp(
      { email: trimmedEmail, role: isSeller ? 'seller' : 'buyer' },
      {
        onSuccess: () => {
          onNext(trimmedEmail);
        },
      },
    );
  };

  const displayError = error || errorMessage;

  return (
    <div className='w-full max-w-md rounded-sm bg-white p-8 shadow-lg'>
      <h2 className='mb-5 text-lg font-medium text-slate-800'>Đăng ký</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <input
            type='email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder='Email'
            disabled={isPending}
            className={`w-full rounded-sm border px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#EE4D2D] disabled:bg-slate-50 disabled:text-slate-400 ${
              displayError ? 'border-red-400' : 'border-slate-300'
            }`}
          />
          {displayError && <p className='mt-1.5 text-xs text-red-500'>{displayError}</p>}
        </div>

        <button
          type='submit'
          disabled={isPending}
          className='mt-5 w-full cursor-pointer rounded-sm bg-[#EE4D2D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isPending ? 'ĐANG GỬI...' : 'TIẾP THEO'}
        </button>

        <div className='my-5 flex items-center gap-3'>
          <span className='h-px flex-1 bg-slate-200' />
          <span className='text-xs text-slate-400'>HOẶC</span>
          <span className='h-px flex-1 bg-slate-200' />
        </div>

        <div className='flex gap-3'>
          <button
            type='button'
            className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-slate-300 py-2 text-sm text-slate-700 hover:bg-slate-50'
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='#1877F2'>
              <path d='M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z' />
            </svg>
            Facebook
          </button>
          <button
            type='button'
            onClick={() => startGoogleAuth(isSeller ? 'seller' : 'buyer')}
            disabled={isGooglePending}
            className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-slate-300 py-2 text-sm text-slate-700 hover:bg-slate-50'
          >
            {isGooglePending ? (
              <svg className='h-4 w-4 animate-spin text-slate-500' viewBox='0 0 24 24' fill='none'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4Z'
                />
              </svg>
            ) : (
              <svg width='16' height='16' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.85Z'
                />
                <path
                  fill='#EA4335'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53Z'
                />
              </svg>
            )}
            Google
          </button>
        </div>

        <p className='mt-5 text-center text-xs leading-relaxed text-slate-400'>
          Bằng việc đăng ký, bạn đã đồng ý với Shopee về{' '}
          <Link to='#' className='text-sky-600 hover:underline'>
            Điều Khoản Dịch Vụ
          </Link>{' '}
          &{' '}
          <Link to='#' className='text-sky-600 hover:underline'>
            Chính Sách Bảo Mật
          </Link>
        </p>

        <p className='mt-4 text-center text-[13px] text-slate-500'>
          Bạn đã có tài khoản?{' '}
          <Link
            to={isSeller ? '/seller/login' : '/buyer/login'}
            className='font-medium text-[#EE4D2D] hover:underline'
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
