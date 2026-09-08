import { create } from 'zustand';
import { useChatWindowStore } from '@/stores';

type ChatbotWindowState = {
  isOpen: boolean;
  openChatbotWindow: () => void;
  closeChatbotWindow: () => void;
  toggleChatbotWindow: () => void;
};

export const useChatbotWindowStore = create<ChatbotWindowState>((set) => ({
  isOpen: false,

  openChatbotWindow: () => {
    useChatWindowStore.getState().closeChatWindow();
    set({ isOpen: true });
  },

  closeChatbotWindow: () => set({ isOpen: false }),

  toggleChatbotWindow: () =>
    set((state) => {
      const nextIsOpen = !state.isOpen;
      if (nextIsOpen) useChatWindowStore.getState().closeChatWindow();
      return { isOpen: nextIsOpen };
    }),
}));
