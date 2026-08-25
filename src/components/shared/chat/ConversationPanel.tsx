import { useEffect } from 'react';
import { useCreateConversation, useGetConversations } from '@/hooks';
import { useChatWindowStore, useAuthStore } from '@/stores';
import WelcomePane from './WelcomePane';
import ActiveConversation from './ActiveConversation';

export default function ConversationPanel() {
  const user = useAuthStore((state) => state.user);
  const selectedConversationId = useChatWindowStore((s) => s.selectedConversationId);
  const pendingShopId = useChatWindowStore((s) => s.pendingShopId);
  const selectConversation = useChatWindowStore((s) => s.selectConversation);
  const role = useAuthStore((s) => s.user?.role)![0];

  const { createConversationAsync } = useCreateConversation();
  const { data: conversations } = useGetConversations({ enabled: !!user });

  useEffect(() => {
    if (pendingShopId && !selectedConversationId) {
      createConversationAsync({ shopId: pendingShopId })
        .then((conversation) => selectConversation(conversation.id))
        .catch(() => {});
    }
  }, [pendingShopId]);

  if (pendingShopId && !selectedConversationId) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <span className='text-sm text-gray-400'>Đang kết nối với shop...</span>
      </div>
    );
  }

  if (!selectedConversationId) {
    return <WelcomePane />;
  }

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId);
  const peerId =
    selectedConversation &&
    (role === 'seller' ? selectedConversation.buyerId : selectedConversation.shopId);

  return (
    <ActiveConversation
      isSeller={role === 'seller'}
      conversationId={selectedConversationId}
      peerId={peerId ?? null}
    />
  );
}
