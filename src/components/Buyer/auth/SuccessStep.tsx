import { useState, useEffect } from 'react';

type SuccessStepProps = {
  email: string;
  onGoHome: () => void;
};

const REDIRECT_SECONDS = 7;

export default function SuccessStep({ email, onGoHome }: SuccessStepProps) {
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onGoHome();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <div className='w-full max-w-md rounded-sm bg-white p-8 text-center shadow-lg'>
      <h2 className='mb-5 text-xl font-medium text-slate-800'>Đăng ký thành công!</h2>

      <div className='mb-5 flex justify-center'>
        <span className='flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#42B54A] text-[#42B54A]'>
          <svg
            width='26'
            height='26'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
          >
            <path d='m5 13 4 4L19 7' />
          </svg>
        </span>
      </div>

      <p className='mb-1 text-sm text-slate-600'>
        Bạn đã tạo thành công tài khoản Shopee với email
      </p>
      <p className='mb-4 text-sm font-medium text-[#EE4D2D]'>{email}</p>

      <p className='mb-6 text-sm text-slate-500'>
        Bạn sẽ được chuyển hướng đến Shopee trong {secondsLeft} giây
      </p>

      <button
        type='button'
        onClick={onGoHome}
        className='w-full cursor-pointer rounded-sm bg-[#EE4D2D] py-2.5 text-sm font-semibold text-white transition hover:bg-[#d8431f]'
      >
        Quay lại Shopee
      </button>
    </div>
  );
}
