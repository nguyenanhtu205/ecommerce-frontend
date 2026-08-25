import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  actionLabel: string;
  icon: ReactNode;
};

type SellerOnboardingGuideProps = {
  shopEmail: string;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Tạo Shop',
    description: 'Đặt tên, ảnh đại diện và mô tả cho gian hàng để khách hàng dễ dàng nhận diện.',
    actionLabel: 'Tạo Shop Ngay',
    icon: (
      <svg
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <path d='M6 6h15l-1.5 9h-12z' />
        <path d='M9 6a3 3 0 0 1 6 0' />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Cài Đặt Vận Chuyển',
    description: 'Chọn đơn vị vận chuyển và thiết lập địa chỉ lấy hàng để bắt đầu giao đơn.',
    actionLabel: 'Cài Đặt Ngay',
    icon: (
      <svg
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <path d='M3 7h11v8H3z' />
        <path d='M14 10h4l3 3v2h-7z' />
        <circle cx='7' cy='18' r='1.6' />
        <circle cx='18' cy='18' r='1.6' />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Đăng Sản Phẩm',
    description: 'Thêm sản phẩm đầu tiên với hình ảnh, giá bán và mô tả chi tiết.',
    actionLabel: 'Đăng Sản Phẩm',
    icon: (
      <svg
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.8'
      >
        <rect x='3' y='4' width='18' height='16' rx='1' />
        <path d='M8 9h8M8 13h8M8 17h5' />
      </svg>
    ),
  },
];

export default function SellerOnboardingGuide({ shopEmail }: SellerOnboardingGuideProps) {
  const navigate = useNavigate();

  return (
    <div className='mx-auto w-full max-w-3xl rounded-sm bg-white p-8 shadow-lg'>
      <div className='mb-2 flex justify-center'>
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

      <h2 className='text-center text-xl font-medium text-slate-800'>
        Chào mừng bạn đến với Shopee!
      </h2>
      <p className='mt-1 mb-8 text-center text-sm text-slate-500'>
        Tài khoản người bán <span className='font-medium text-[#EE4D2D]'>{shopEmail}</span> đã được
        tạo. Hoàn thành 3 bước sau để bắt đầu bán hàng:
      </p>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {ONBOARDING_STEPS.map((step) => (
          <div
            key={step.id}
            className='flex flex-col items-center rounded-sm border border-slate-100 p-5 text-center transition hover:border-[#EE4D2D]/40 hover:shadow-md'
          >
            <span className='mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#EE4D2D] text-xs font-bold text-white'>
              {step.id}
            </span>
            <span className='mb-3 text-[#EE4D2D]'>{step.icon}</span>
            <h3 className='mb-1.5 text-sm font-semibold text-slate-800'>{step.title}</h3>
            <p className='mb-4 text-xs leading-relaxed text-slate-500'>{step.description}</p>
            <button
              onClick={() => navigate('/seller/onboarding')}
              type='button'
              className='mt-auto rounded-sm border border-[#EE4D2D] px-4 py-1.5 text-xs font-medium text-[#EE4D2D] hover:bg-[#FFF4F1]'
            >
              {step.actionLabel}
            </button>
          </div>
        ))}
      </div>

      <div className='mt-8 flex justify-center'>
        <button
          type='button'
          onClick={() => navigate('/seller/onboarding')}
          className='cursor-pointer rounded-sm bg-[#EE4D2D] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#d8431f]'
        >
          Vào Kênh Người Bán
        </button>
      </div>
    </div>
  );
}
