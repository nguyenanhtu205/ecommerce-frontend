import { useState, useEffect, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import { useVerifyOtp } from '@/hooks';

type OtpStepProps = {
  email: string;
  onVerified: () => void;
  onBack: () => void;
};

const RESEND_SECONDS = 44;

export default function OtpStep({ email, onVerified, onBack }: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { verifyOtp, isPending, errorMessage } = useVerifyOtp();

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (error) setError('');

    if (value && index < digits.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length < 6) {
      setError('Vui lòng nhập đủ 6 số');
      return;
    }

    setError('');
    verifyOtp(
      { email, otp: code },
      {
        onSuccess: () => {
          onVerified();
        },
      },
    );
  };

  const handleResend = () => {
    setDigits(Array(6).fill(''));
    setError('');
    setSecondsLeft(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    // TODO: gọi lại API request-otp (useRequestOtp) để gửi mã mới, hiện chưa có trong phạm vi hook này.
  };

  const displayError = error || errorMessage;

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

      <h2 className='mb-2 text-center text-xl font-medium text-slate-800'>Nhập mã xác nhận</h2>
      <p className='mb-6 text-center text-sm text-slate-500'>
        Mã xác thực sẽ được gửi qua Email đến
        <br />
        <span className='font-medium text-slate-700'>{email}</span>
      </p>

      <div className='mb-2 flex justify-center gap-2'>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={digit}
            disabled={isPending}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`h-11 w-10 rounded-sm border text-center text-lg font-medium text-slate-800 outline-none focus:border-[#EE4D2D] disabled:bg-slate-50 disabled:text-slate-400 ${
              displayError ? 'border-red-400' : 'border-slate-300'
            }`}
          />
        ))}
      </div>
      {displayError && <p className='mb-2 text-center text-xs text-red-500'>{displayError}</p>}

      <p className='mb-6 text-center text-xs text-slate-400'>
        {secondsLeft > 0 ? (
          `Vui lòng chờ ${secondsLeft} giây để gửi lại.`
        ) : (
          <button
            type='button'
            onClick={handleResend}
            className='font-medium text-[#EE4D2D] hover:underline'
          >
            Gửi lại mã
          </button>
        )}
      </p>

      <button
        type='button'
        onClick={handleSubmit}
        disabled={isPending}
        className='w-full cursor-pointer rounded-sm bg-[#EE4D2D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-60'
      >
        {isPending ? 'ĐANG XÁC THỰC...' : 'KẾ TIẾP'}
      </button>
    </div>
  );
}
