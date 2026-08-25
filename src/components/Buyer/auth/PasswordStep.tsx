import { useState, useMemo } from 'react';
import { useSetPassword } from '@/hooks';

type PasswordStepProps = {
  email: string;
  onSubmit: (password: string) => void;
  onBack: () => void;
};

const ALLOWED_CHARS_REGEX = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/;

export default function PasswordStep({ email, onSubmit, onBack }: PasswordStepProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { setPassword: submitPassword, isPending, errorMessage } = useSetPassword();

  const rules = useMemo(() => {
    return {
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasValidLength: password.length >= 8 && password.length <= 16,
      hasAllowedChars: password.length > 0 && ALLOWED_CHARS_REGEX.test(password),
    };
  }, [password]);

  const isValid =
    rules.hasLowerCase && rules.hasUpperCase && rules.hasValidLength && rules.hasAllowedChars;

  const handleSubmit = () => {
    if (!isValid || isPending) return;

    submitPassword(
      { email, password },
      {
        onSuccess: () => {
          onSubmit(password);
        },
      },
    );
  };

  return (
    <div className='w-full max-w-md rounded-sm bg-white p-8 shadow-lg'>
      <button
        type='button'
        onClick={onBack}
        className='mb-2 text-slate-400 hover:text-slate-600'
        aria-label='Quay lại'
      >
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='m15 18-6-6 6-6' />
        </svg>
      </button>

      <h2 className='mb-2 text-center text-xl font-medium text-slate-800'>Thiết Lập Mật Khẩu</h2>
      <p className='mb-6 text-center text-sm text-slate-500'>
        Bước cuối! Thiết lập mật khẩu để hoàn tất việc đăng ký.
      </p>

      <div className='relative mb-4'>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Mật khẩu'
          disabled={isPending}
          className='w-full rounded-sm border border-slate-300 px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none focus:border-[#EE4D2D] disabled:bg-slate-50'
        />
        <button
          type='button'
          onClick={() => setShowPassword((v) => !v)}
          className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600'
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
      </div>

      <ul className='mb-6 space-y-1.5'>
        <RuleItem ok={rules.hasLowerCase} label='Ít nhất một kí tự viết thường' />
        <RuleItem ok={rules.hasUpperCase} label='Ít nhất một kí tự viết hoa' />
        <RuleItem ok={rules.hasValidLength} label='8-16 kí tự' />
        <RuleItem
          ok={rules.hasAllowedChars}
          label='Chỉ các chữ cái, số và ký tự phổ biến mới có thể được sử dụng'
        />
      </ul>

      {errorMessage && <p className='mb-4 text-center text-xs text-red-500'>{errorMessage}</p>}

      <button
        type='button'
        onClick={handleSubmit}
        disabled={!isValid || isPending}
        className={`w-full cursor-pointer rounded-sm py-2.5 text-sm font-semibold text-white transition ${
          isValid && !isPending
            ? 'bg-[#EE4D2D] hover:bg-[#d8431f]'
            : 'cursor-not-allowed bg-[#EE4D2D]/50'
        }`}
      >
        {isPending ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
      </button>
    </div>
  );
}

function RuleItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-start gap-1.5 text-xs ${ok ? 'text-[#42B54A]' : 'text-slate-400'}`}>
      <svg
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='3'
        className='mt-0.5 shrink-0'
      >
        {ok ? <path d='m5 13 4 4L19 7' /> : <circle cx='12' cy='12' r='9' strokeWidth='1.5' />}
      </svg>
      <span>{label}</span>
    </li>
  );
}
