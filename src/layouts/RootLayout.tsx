import { Outlet } from 'react-router-dom';
import { ChatbotButton, ChatbotWindow, ChatButton, ChatWindow, TopBar } from '@/components';

export default function RootLayout() {
  return (
    <>
      <TopBar />
      <Outlet />
      <ChatButton />
      <ChatbotButton />
      <ChatWindow />
      <ChatbotWindow />
    </>
  );
}
