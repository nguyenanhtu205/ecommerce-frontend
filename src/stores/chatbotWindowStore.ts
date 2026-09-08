import { create } from 'zustand';

type ChatbotWindowState = {
  isOpen: boolean;
  openChatbotWindow: () => void;
  closeChatbotWindow: () => void;
  toggleChatbotWindow: () => void;
};

export const useChatbotWindowStore = create<ChatbotWindowState>((set) => ({
  isOpen: false,
  openChatbotWindow: () => set({ isOpen: true }),
  closeChatbotWindow: () => set({ isOpen: false }),
  toggleChatbotWindow: () => set((state) => ({ isOpen: !state.isOpen })),
}));
