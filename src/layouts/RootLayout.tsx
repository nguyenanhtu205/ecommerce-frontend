import { Outlet } from 'react-router-dom';
import { ChatButton, ChatWindow, TopBar } from '@/components';

export default function RootLayout() {
  return (
    <>
      <TopBar />
      <Outlet />
      <ChatButton />
      <ChatWindow />
    </>
  );
}
