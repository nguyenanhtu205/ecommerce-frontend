import { BsRobot } from 'react-icons/bs';
import { useAuthStore } from '@/stores';
import { useChatbotWindowStore } from '@/stores/chatbotWindowStore';
import { useChatWindowStore } from '@/stores/chatWindowStore';

export default function ChatbotButton() {
  const user = useAuthStore((state) => state.user);

  const isOpen = useChatbotWindowStore((state) => state.isOpen);
  const openChatbotWindow = useChatbotWindowStore((state) => state.openChatbotWindow);

  const isChatWindowOpen = useChatWindowStore((state) => state.isOpen);

  if (!user || isOpen || isChatWindowOpen) return null;

  return (
    <button
      onClick={openChatbotWindow}
      title='Trợ lý ảo — hỏi đáp về cách sử dụng hệ thống'
      className='fixed right-1 bottom-16 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#EE4D2D] shadow-lg transition hover:shadow-xl'
    >
      <BsRobot className='text-2xl' />
    </button>
  );
}
