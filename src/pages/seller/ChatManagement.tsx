import { type ReactNode } from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { MdOutlineQuestionAnswer } from 'react-icons/md';
import { FiMessageSquare } from 'react-icons/fi';
import { SellerBreadcrumb } from '@/components';
import { Link } from 'react-router-dom';
import { BsQuestionCircle } from 'react-icons/bs';

type ChatAssistant = {
  title: string;
  description: string;
  tag: string;
  action: string;
  icon: ReactNode;
};

const CHAT_ASSISTANTS: ChatAssistant[] = [
  {
    title: 'Tin nhắn tự động',
    description: 'Tự động gửi lời chào khi người mua bắt đầu cuộc tò chuyện.',
    tag: 'Phản hồi nhanh',
    action: 'Chỉnh sửa',
    icon: <IoChatbubbleEllipsesOutline />,
  },
  {
    title: 'Tin nhắn nhanh',
    description:
      'Giúp bộ phận chăm sóc khách hàng phản hồi nhanh hơn thông qua mẫu tin nhắn có sẵn.',
    tag: 'Cải thiện hiệu quả phản hồi',
    action: 'Chỉnh sửa',
    icon: <FiMessageSquare />,
  },
  {
    title: 'Hỏi - Đáp',
    description: 'Tự động gửi các câu hỏi thường gặp để người mua bắt đầu trò chuyện dễ dàng hơn.',
    tag: 'Tiết kiệm nhân lực',
    action: 'Chỉnh sửa',
    icon: <MdOutlineQuestionAnswer />,
  },
];

function StatItem({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className='flex-1 px-6 first:pl-0 last:pr-0'>
      <div className='mb-2 flex items-center gap-1 text-xs text-slate-500'>
        <span>{label}</span>
      </div>

      <div className='mb-2 text-2xl font-medium text-slate-800'>{value}</div>

      <div className='text-xs text-slate-400'>
        so với ngày trước đó{' '}
        <span className={positive ? 'text-emerald-500' : 'text-red-500'}>
          {positive ? '▲' : '▼'} {change}
        </span>
      </div>
    </div>
  );
}

function AssistantCard({ assistant }: { assistant: ChatAssistant }) {
  return (
    <div className='rounded-sm border border-slate-200 bg-white px-5 py-4'>
      <div className='mb-4 flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center bg-[#EE4D2D] text-xl text-white'>
          {assistant.icon}
        </div>

        <div className='min-w-0'>
          <div className='mb-1 flex items-center gap-1 text-sm font-medium text-slate-800'>
            {assistant.title}
            <BsQuestionCircle className='ml-0.5' />
          </div>

          <span className='inline-block border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-500'>
            {assistant.tag}
          </span>
        </div>
      </div>

      <div className='mb-5 min-h-12 text-xs leading-5 text-slate-500'>{assistant.description}</div>

      <div className='flex justify-end'>
        <Link
          to={'/seller/shop/settings/chat'}
          className='cursor-pointer rounded-sm border border-[#EE4D2D] px-4 py-1.5 text-xs text-[#EE4D2D] hover:bg-[#fff5f2]'
        >
          {assistant.action}
        </Link>
      </div>
    </div>
  );
}

export default function ChatManagement() {
  return (
    <div>
      <SellerBreadcrumb
        items={[
          { label: 'Trang Chủ', path: '/seller' },
          { label: 'Chăm Sóc Khách Hàng' },
          { label: 'Quản Lý Chat' },
        ]}
      />

      <div className='bg-white'>
        <div className='px-6 pt-4'>
          <h1 className='text-base font-medium text-slate-800'>Quản Lý Chat</h1>
        </div>

        <div className='border-b border-slate-100 px-6 py-5'>
          <div className='flex divide-x divide-slate-200'>
            <StatItem label='Lượt chat' value='39' change='5,41%' positive />

            <StatItem label='Tỷ lệ phản hồi chat' value='0,21%' change='0,06%' positive={false} />

            <StatItem label='Thời gian phản hồi' value='00:00:40' change='99,53%' positive />
          </div>
        </div>
      </div>

      <div className='mt-6 bg-white'>
        <div className='px-6 py-5'>
          <div className='mb-4'>
            <h2 className='text-base font-medium text-slate-800'>Trợ lý Chat</h2>
          </div>

          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {CHAT_ASSISTANTS.map((assistant) => (
              <AssistantCard key={assistant.title} assistant={assistant} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
