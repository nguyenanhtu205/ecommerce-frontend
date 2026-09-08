import { IoIosChatboxes } from 'react-icons/io';
import { useAuthStore, useChatWindowStore } from '@/stores';
import { useChatbotWindowStore } from '@/stores/chatbotWindowStore';
import { useGetConversations } from '@/hooks';

export default function ChatButton() {
  const user = useAuthStore((state) => state.user);
  const isOpen = useChatWindowStore((state) => state.isOpen);
  const openChatWindow = useChatWindowStore((state) => state.openChatWindow);

  const isChatbotWindowOpen = useChatbotWindowStore((state) => state.isOpen);

  const { data: conversations } = useGetConversations({ enabled: !!user });

  if (!user || isOpen || isChatbotWindowOpen) return null;

  const totalUnread = (conversations ?? []).reduce(
    (sum, c) => sum + (user.role[0] === 'seller' ? c.sellerUnreadCount : c.buyerUnreadCount),
    0,
  );

  return (
    <button
      onClick={openChatWindow}
      className='fixed right-1 bottom-0.5 z-50 flex cursor-pointer items-center gap-2 rounded-md bg-white px-4 py-3 text-lg font-medium text-[#EE4D2D] shadow-lg transition hover:shadow-xl'
    >
      <IoIosChatboxes className='text-2xl' />
      <span>Chat</span>

      {totalUnread > 0 && (
        <span className='absolute -top-2.5 -left-2.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#EE4D2D] px-1 text-xs leading-none font-bold text-white ring-2 ring-white'>
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </button>
  );
}
