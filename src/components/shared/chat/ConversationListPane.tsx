import { useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { useAuthStore, useChatWindowStore } from '@/stores';
import { useConversationPeerInfo, useGetConversations } from '@/hooks';
import { formatConversationTime } from '@/utils';

export default function ConversationListPane() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const role = useAuthStore((s) => s.user?.role)![0];
  const ownSenderType: 'buyer' | 'shop' = role === 'seller' ? 'shop' : 'buyer';
  const selectedConversationId = useChatWindowStore((s) => s.selectedConversationId);
  const selectConversation = useChatWindowStore((s) => s.selectConversation);

  const { data: conversations, isPending } = useGetConversations({ enabled: !!user });

  const peerIds = (conversations ?? []).map((c) => (role === 'seller' ? c.buyerId : c.shopId));
  const peerInfoMap = useConversationPeerInfo(peerIds, role);

  const visibleConversations = (conversations ?? []).filter((c) => {
    return !(role === 'seller' && c.lastMessageSenderType === '');
  });

  const filtered = visibleConversations.filter((c) =>
    c.lastMessage.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='flex w-70 shrink-0 flex-col border-r border-gray-200'>
      <div className='border-b border-gray-200 p-2'>
        <div className='flex items-center gap-1.5 rounded border border-gray-200 px-2 py-1.5'>
          <span className='text-gray-400'>
            <CiSearch />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Tìm theo tên'
            className='w-full text-sm outline-none'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {isPending ? (
          <div className='divide-y divide-gray-200'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3 px-3 py-2'>
                <div className='h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <div className='h-3.5 w-24 animate-pulse rounded bg-gray-200' />
                  <div className='h-3 w-36 animate-pulse rounded bg-gray-200' />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex h-full items-center justify-center p-6 text-center text-sm text-gray-400'>
            Không tìm thấy cuộc hội thoại nào.
          </div>
        ) : (
          filtered.map((c) => {
            const unread = role === 'seller' ? c.sellerUnreadCount : c.buyerUnreadCount;
            const isActive = c.id === selectedConversationId;
            const peerId = role === 'seller' ? c.buyerId : c.shopId;
            const peerInfo = peerInfoMap.get(peerId);

            const hasNoMessage = c.lastMessageSenderType === '';
            const isOwnLastMessage = c.lastMessageSenderType === ownSenderType;
            const lastMessagePreview = hasNoMessage
              ? 'Bắt đầu trò chuyện'
              : c.lastMessage.trim()
                ? c.lastMessage
                : '[File phương tiện]';

            return (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`flex w-full cursor-pointer items-center gap-3 border-b border-gray-200 px-3 py-2 text-left hover:bg-gray-50 ${
                  isActive ? 'bg-sky-50' : ''
                }`}
              >
                {peerInfo?.isAvatarLoading ? (
                  <div className='h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200' />
                ) : peerInfo?.avatarUrl ? (
                  <img
                    src={peerInfo.avatarUrl}
                    alt=''
                    className='h-9 w-9 shrink-0 rounded-full object-cover'
                  />
                ) : (
                  <div className='h-9 w-9 shrink-0 rounded-full bg-gray-200' />
                )}

                <div className='min-w-0 flex-1'>
                  {peerInfo?.isNameLoading ? (
                    <div className='h-3.5 w-24 animate-pulse rounded bg-gray-200' />
                  ) : (
                    <div className='truncate text-sm font-medium'>
                      {peerInfo?.found ? peerInfo.name : 'Người dùng không xác định'}
                    </div>
                  )}
                  <div className='mt-1 truncate text-xs text-gray-500'>
                    {!hasNoMessage && isOwnLastMessage ? 'Bạn: ' : ''}
                    {lastMessagePreview}
                  </div>
                </div>

                <div className='flex shrink-0 flex-col items-end gap-1'>
                  {!hasNoMessage && (
                    <span className='text-[11px] text-gray-400'>
                      {formatConversationTime(c.lastMessageAt)}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className='rounded-full bg-[#EE4D2D] px-1.5 py-0.5 text-[10px] text-white'>
                      {unread}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
