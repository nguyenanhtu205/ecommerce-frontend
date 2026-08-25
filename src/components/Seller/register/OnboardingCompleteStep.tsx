import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@/stores';

type OnboardingCompleteStepProps = {
  shopName: string;
};

export default function OnboardingCompleteStep({ shopName }: OnboardingCompleteStepProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoToSeller = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh-user-token`,
        {},
        { withCredentials: true },
      );

      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.getState().setAuth(user, response.data.accessToken);
      }

      navigate('/seller');
    } catch (error) {
      navigate('/seller/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center px-10 py-14 text-center'>
      <span className='flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#42B54A] text-[#42B54A]'>
        <svg
          width='30'
          height='30'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2.5'
        >
          <path d='m5 13 4 4L19 7' />
        </svg>
      </span>
      <h2 className='mt-5 text-lg font-medium text-slate-800'>Thiết lập Shop thành công!</h2>
      <p className='mt-2 max-w-md text-sm text-slate-500'>
        Shop <span className='font-medium text-[#EE4D2D]'>{shopName}</span> đã sẵn sàng nhận đơn.
        Bạn có thể tiếp tục hoàn thiện thông tin định danh và thuế sau tại Kênh Người Bán.
      </p>
      <button
        type='button'
        onClick={handleGoToSeller}
        disabled={isLoading}
        className='mt-8 cursor-pointer bg-[#EE4D2D] px-8 py-2.5 text-sm font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-70'
      >
        {isLoading ? 'Đang xử lý...' : 'Vào Kênh Người Bán'}
      </button>
    </div>
  );
}
