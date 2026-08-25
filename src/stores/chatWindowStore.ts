import { create } from 'zustand';
import { useAuthStore } from '@/stores';

type ChatWindowState = {
  isOpen: boolean;
  selectedConversationId: string | null;
  pendingShopId: string | null;

  openChatWindow: () => void;
  closeChatWindow: () => void;
  toggleChatWindow: () => void;
  selectConversation: (conversationId: string) => void;
  startConversationWithShop: (shopId: string) => void;
};

export const useChatWindowStore = create<ChatWindowState>((set) => ({
  isOpen: false,
  selectedConversationId: null,
  pendingShopId: null,

  openChatWindow: () => set({ isOpen: true }),
  closeChatWindow: () => set({ isOpen: false }),
  toggleChatWindow: () => set((state) => ({ isOpen: !state.isOpen })),

  selectConversation: (conversationId) =>
    set({ selectedConversationId: conversationId, pendingShopId: null }),

  startConversationWithShop: (shopId) => {
    const roles = useAuthStore.getState().user?.role;
    if (roles == undefined) return;
    if (roles[0] !== 'buyer') return;
    set({ isOpen: true, pendingShopId: shopId, selectedConversationId: null });
  },
}));
