import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginWithGoogle, PENDING_ROLE_KEY } from '@/hooks';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle, isPending, errorMessage } = useLoginWithGoogle();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const role = localStorage.getItem(PENDING_ROLE_KEY) ?? 'buyer';

    localStorage.removeItem(PENDING_ROLE_KEY);

    if (error || !code || !state) {
      navigate(role === 'seller' ? '/seller/login' : '/buyer/login', { replace: true });
      return;
    }

    loginWithGoogle(
      { authorizationCode: code, state, role },
      {
        onError: () => {
          navigate(role === 'seller' ? '/seller/login' : '/buyer/login', { replace: true });
        },
      },
    );
  }, [searchParams, navigate, loginWithGoogle]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <svg width='40' height='40' viewBox='0 0 24 24'>
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
      <p className='text-sm text-slate-500'>
        {isPending ? 'Đang xử lý đăng nhập Google...' : (errorMessage ?? 'Đang chuyển hướng...')}
      </p>
    </div>
  );
}
