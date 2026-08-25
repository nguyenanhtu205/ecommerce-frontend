import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin, useStartGoogleAuth } from '@/hooks';
import { useAuthStore } from '@/stores';

type LoginFormProps = {
  registerHref?: string;
  isSeller?: boolean;
};

export default function LoginForm({
  registerHref = '/buyer/register',
  isSeller = false,
}: LoginFormProps) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { startGoogleAuth, isPending: isGooglePending } = useStartGoogleAuth();

  const navigate = useNavigate();
  const { login, isPending, errorMessage } = useLogin();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    login(
      { email: account, password },
      {
        onSuccess: async () => {
          const user = useAuthStore.getState().user;

          const primaryRole = user?.role[0];
          if (primaryRole === 'buyer') {
            navigate('/');
            return;
          }
          if (primaryRole === 'seller') {
            navigate('/seller');
            return;
          }
        },
      },
    );
  };

  return (
    <div className='w-full max-w-md rounded-sm bg-white p-8 shadow-lg'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-medium text-slate-800'>Đăng nhập</h2>
        <button
          type='button'
          className='flex items-center gap-2 rounded-sm border border-amber-400 bg-amber-50 px-3 py-2 hover:bg-amber-100'
        >
          <span className='text-xs font-medium text-amber-600'>
            Đăng nhập
            <br />
            với mã QR
          </span>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#EE4D2D'
            strokeWidth='1.5'
          >
            <rect x='3' y='3' width='7' height='7' />
            <rect x='14' y='3' width='7' height='7' />
            <rect x='3' y='14' width='7' height='7' />
            <path d='M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z' />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <input
          type='text'
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder='Email'
          className='w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#EE4D2D]'
        />

        <div className='relative mt-4'>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Mật khẩu'
            className='w-full rounded-sm border border-slate-300 px-3 py-2.5 pr-28 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#EE4D2D]'
          />
          <button
            type='button'
            onClick={() => setShowPassword((v) => !v)}
            className='absolute top-1/2 right-20 -translate-y-1/2 text-slate-400 hover:text-slate-600'
            aria-label='Hiện/ẩn mật khẩu'
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              {showPassword ? (
                <>
                  <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z' />
                  <circle cx='12' cy='12' r='3' />
                </>
              ) : (
                <>
                  <path d='M3 3l18 18' />
                  <path d='M10.6 10.6a3 3 0 0 0 4.24 4.24' />
                  <path d='M6.7 6.7C4.4 8.1 2.7 10.2 2 12c0 0 3.5 7 10 7 1.8 0 3.4-.4 4.8-1.1M17.9 17.9C19.9 16.5 21.4 14.3 22 12c0 0-3.5-7-10-7-.7 0-1.4.1-2 .2' />
                </>
              )}
            </svg>
          </button>

          <Link
            to='#'
            className='absolute top-1/2 right-3 -translate-y-1/2 text-right text-xs leading-tight text-sky-600 hover:underline'
          >
            Quên mật
            <br />
            khẩu?
          </Link>
        </div>

        {errorMessage && <p className='mt-3 text-xs text-red-500'>{errorMessage}</p>}

        <button
          type='submit'
          disabled={isPending}
          className='mt-5 w-full cursor-pointer rounded-sm bg-[#EE4D2D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isPending ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
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
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <Link to='#' className='text-[#EE4D2D] hover:underline'>
            Điều khoản dịch vụ
          </Link>{' '}
          &{' '}
          <Link to='#' className='text-[#EE4D2D] hover:underline'>
            Chính sách bảo mật
          </Link>{' '}
          của Shopee
        </p>

        <p className='mt-4 text-center text-[13px] text-slate-400'>
          Bạn mới biết đến Shopee?{' '}
          <Link to={registerHref} className='font-medium text-[#EE4D2D] hover:underline'>
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
}
