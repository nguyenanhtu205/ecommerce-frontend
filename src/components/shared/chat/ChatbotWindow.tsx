import { useEffect, useRef, useState } from 'react';
import { BsRobot } from 'react-icons/bs';
import { RiSendPlaneLine } from 'react-icons/ri';
import { X } from 'lucide-react';
import { useChatbotWindowStore } from '@/stores/chatbotWindowStore';
import useGetChatHistory from '@/hooks/chatbot/useGetChatHistory';
import useAskQuestion from '@/hooks/chatbot/useAskQuestion';

const FAQ_QUESTIONS = [
  'Làm sao để tạo đơn hàng?',
  'Làm sao để đổi/trả sản phẩm?',
  'Làm sao để liên hệ với shop?',
];

export default function ChatbotWindow() {
  const isOpen = useChatbotWindowStore((s) => s.isOpen);
  const closeChatbotWindow = useChatbotWindowStore((s) => s.closeChatbotWindow);

  const { data, isPending: isHistoryPending } = useGetChatHistory();
  const { mutate: askQuestion, isPending: isAsking } = useAskQuestion();

  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ?? [];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, isAsking]);

  if (!isOpen) return null;

  const handleAsk = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isAsking) return;
    setContent('');
    askQuestion({ question: trimmed });
  };

  return (
    <div className='fixed right-1 bottom-0.5 z-50 flex h-125 w-87.5 flex-col overflow-hidden rounded-lg bg-white shadow-xl'>
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-2.5'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500'>
            <BsRobot className='text-sm text-white' />
          </span>
          <span className='truncate text-sm font-medium'>Chatbot</span>
        </div>
        <button
          onClick={closeChatbotWindow}
          aria-label='Đóng'
          className='cursor-pointer text-gray-400 hover:text-orange-500'
        >
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className='flex-1 overflow-y-auto px-3 py-2'>
        {isHistoryPending ? (
          <HistorySkeleton />
        ) : messages.length === 0 ? (
          <FaqQuestions onPick={handleAsk} />
        ) : (
          messages.map((m, idx) => <MessageBubble key={idx} role={m.role} content={m.content} />)
        )}

        {isAsking && <TypingBubble />}
      </div>

      <div className='flex items-center gap-2 border-t border-gray-200 p-2'>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk(content);
          }}
          placeholder='Nhập câu hỏi'
          disabled={isAsking}
          className='flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-orange-500 disabled:bg-gray-50'
        />
        <button
          title='Gửi'
          onClick={() => handleAsk(content)}
          disabled={!content.trim() || isAsking}
          className='cursor-pointer text-xl text-gray-400 hover:text-orange-500 disabled:cursor-not-allowed disabled:text-gray-300'
        >
          <RiSendPlaneLine />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`mb-2 flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500'>
          <BsRobot className='text-[11px] text-white' />
        </span>
      )}
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
          isUser ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className='mb-2 flex items-end gap-2'>
      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500'>
        <BsRobot className='text-[11px] text-white' />
      </span>
      <div className='flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2.5'>
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]' />
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]' />
        <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400' />
      </div>
    </div>
  );
}

function FaqQuestions({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-3 px-4 text-center'>
      <p className='text-sm text-gray-500'>
        Chào bạn! Mình có thể giúp gì về cách sử dụng hệ thống?
      </p>
      <div className='flex w-full flex-col gap-2'>
        {FAQ_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className='rounded border border-gray-200 px-3 py-1.5 text-left text-sm text-[#EE4D2D] hover:cursor-pointer hover:bg-orange-50'
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className='space-y-3 py-2'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className='h-8 w-40 animate-pulse rounded-lg bg-gray-200' />
        </div>
      ))}
    </div>
  );
}
