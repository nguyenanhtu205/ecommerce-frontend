import { useChatWindowStore } from '@/stores';
import ConversationListPane from './ConversationListPane';
import ConversationPanel from './ConversationPanel';

export default function ChatWindow() {
  const isOpen = useChatWindowStore((s) => s.isOpen);
  const closeChatWindow = useChatWindowStore((s) => s.closeChatWindow);

  if (!isOpen) return null;

  return (
    <div className='fixed right-1 bottom-0.5 z-70 flex h-125 w-175 flex-col overflow-hidden rounded-lg bg-white shadow-xl'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-2.5'>
        <span className='font-medium text-[#EE4D2D]'>Chat</span>
        <div className='flex items-center gap-3 text-gray-400'>
          <button
            onClick={closeChatWindow}
            title='Đóng'
            className='cursor-pointer hover:text-[#EE4D2D]'
          >
            ✕
          </button>
        </div>
      </div>

      <div className='flex min-h-0 flex-1'>
        <ConversationListPane />
        <ConversationPanel />
      </div>
    </div>
  );
}
