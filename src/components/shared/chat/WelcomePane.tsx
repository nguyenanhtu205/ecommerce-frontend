import { IoIosChatbubbles } from 'react-icons/io';

export default function WelcomePane() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center'>
      <div className='text-5xl text-[#EE4D2D]'>
        <IoIosChatbubbles />
      </div>
      <div className='text-base font-medium text-gray-700'>Chào mừng bạn đến với Shopee Chat</div>
      <div className='text-sm text-gray-400'>Chọn một cuộc trò chuyện để bắt đầu</div>
    </div>
  );
}
