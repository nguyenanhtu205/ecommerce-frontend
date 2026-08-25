import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export default function Forbidden() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleBackHome = () => {
    const role = user?.role?.[0];

    if (role === 'seller') {
      navigate('/seller');
      return;
    }

    navigate('/');
  };

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-white'>
      <div className='flex flex-col items-center text-center'>
        <svg
          width='120'
          height='120'
          viewBox='0 0 120 120'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='mb-4'
          aria-hidden='true'
        >
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M92.8 25.3c1.5-1.5 3.2-3.4 2.2-9.2C93.4 7 78.8-1.5 66.4 5.7c-7.7 4.4-9 8-10 10.8-.7 1.7-1.2 3-3 4-2 1.2-4.2.2-6.5-.9-3-1.4-6.4-3-10.6-.4-5 3-4 7.2-3.4 10.3.3 1.6.6 2.9 0 3.6l-.8.6-7.6 1.8a9.9 9.9 0 0 0-3.3 2.2c-4.2 4-4.6 9.6.9 13.4 3 2 6.3 1.5 9.2 1 2.7-.5 5-.9 6.4.6 1.5 1.5 1.2 2.6.8 3.9-.4 1.5-.9 3.2 1 6.4 2 3.4 5 3.2 7.6 3 1.8-.2 3.5-.3 4.8.7 2.2 1.6 3.3 4 3.3 7.3h8.6c0-1.9 1.2-4.3 3.7-7.3 1.8-2.2 4-2.5 6.4-2.8 2.6-.4 5.5-.8 8.2-3.7 3.2-3.3 2.6-6.5 2.1-9-.2-1.5-.5-2.8.5-3.5.8-.6 2-.7 3.5-.7 3.1-.2 7-.5 9.2-5.7 2-4.8-1-7.4-3.4-9.5-1.4-1.2-2.7-2.3-2.7-3.6 0-1.3.7-2 1.5-2.9Z'
            fill='#E8E8E8'
          />

          <path
            d='M16.3 23a2 2 0 0 0-2.4 3.2l27 20.4a2 2 0 0 0 2.4-3.2l-27-20.3Zm20 54.8c0-1.6 1.4-3 3.5-3h40.8c2.1 0 3.6 1.4 3.5 3l-1.7 32.3a3.6 3.6 0 0 1-3.5 3.2H41.6a3.5 3.5 0 0 1-3.5-3.2l-1.8-32.3Z'
            fill='white'
          />

          <path
            d='M84.5 18.5c.5-.3.6-.9.3-1.3l-1-1.9 1-1.7a1 1 0 0 0-1-1.6l-2 .6-1.4-1.7a1 1 0 0 0-1.7.5l-.2 2.2-2 .7a1 1 0 0 0 0 1.9l2 .8v2a1 1 0 0 0 1.8.7l1.4-1.6 2 .5c.3.1.6 0 .8 0Z'
            fill='#BDBDBD'
          />

          <path
            d='M53.8 47.5 50 46.3a1 1 0 1 0-.6 2l3.8 1a1 1 0 1 0 .6-1.8Zm-4.2-5.6 4-.2a1 1 0 0 1 0 2l-4 .2a1 1 0 0 1 0-2Zm-1.8 7.8a1 1 0 0 0-1.4 1.5l3 2.8a1 1 0 1 0 1.3-1.5l-2.9-2.8ZM43 51.1a1 1 0 0 1 1.3.7l1.3 3.7a1 1 0 0 1-1.9.7l-1.3-3.8a1 1 0 0 1 .6-1.3Zm18.3-20.7-2-.4.5-2a1 1 0 0 0-2-.3l-.4 2-2-.4a1 1 0 0 0-.3 2l2 .3-.5 2a1 1 0 1 0 2 .4l.4-2 2 .4a1 1 0 0 0 .3-2Zm10 12.4c1.6-2 3.6-2.5 6-1.4 3.4 1.5 3.8 5.5.9 7.1-.6.4-.8.5-2 .9-1.2.5-1.6.8-2.2 1.9a1 1 0 1 1-1.8-1 5.4 5.4 0 0 1 3.3-2.8l1.7-.7c1.4-.8 1.3-2.7-.7-3.6-1.6-.7-2.6-.4-3.6.8a1 1 0 1 1-1.6-1.2Zm1.2 10.4a1.3 1.3 0 1 0 0 2.5 1.3 1.3 0 0 0 0-2.5Z'
            fill='#BDBDBD'
          />

          <path
            d='M33.1 60c.6 0 1-.6.9-1.1-.2-1.2-.6-2-1.4-2.8-1.3-1.2-2.5-1.2-6.3-1h-3.4c-2.8 0-4.8-.8-6.3-2.7a11.5 11.5 0 0 1-1.6-12 1 1 0 1 0-1.9-.8c-2 5.1-1.3 9.8 2 14 1.8 2.4 4.3 3.5 7.7 3.6l3.6-.1c3.1-.2 4.2-.1 4.8.4.5.5.7 1 .8 1.6 0 .6.6 1 1.1.9Zm71.6-15.6a1 1 0 1 1-1.9-.8c2.2-5 1.3-8.8-1.6-12.7l-2-2.3v-.2c-.8-1-1.2-1.6-1.2-2.3 0-.6.1-1 .4-1.8l.6-1.5.1-.3c1.5-3.7 1.5-6.5-1-10a1 1 0 1 1 1.7-1c2.9 4 2.9 7.5 1.2 11.7l-.2.4-.5 1.4-.3 1c0 .2.2.5.7 1.2l2.1 2.5c3.3 4.5 4.3 9 1.9 14.7Z'
            fill='#BDBDBD'
          />
        </svg>

        <h1 className='mb-2 text-[16px] leading-6 font-medium text-[#444]'>403</h1>

        <p className='mb-5 text-[14px] leading-5 text-[#666]'>
          Bạn không có quyền truy cập vào trang này!
        </p>

        <button
          type='button'
          onClick={handleBackHome}
          className='cursor-pointer rounded-xs bg-[#f4513a] px-4 py-2.5 text-[14px] leading-5 font-medium text-white transition-colors hover:bg-[#e8442f] focus:ring-2 focus:ring-[#f4513a]/30 focus:outline-none'
        >
          Trở về trang chủ
        </button>
      </div>
    </div>
  );
}
