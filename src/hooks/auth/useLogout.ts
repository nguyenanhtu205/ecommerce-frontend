import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useChatbotWindowStore, useChatWindowStore } from '@/stores';
import { axiosPrivate } from '@/utils';

const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const closeChatWindow = useChatWindowStore((state) => state.closeChatWindow);
  const closeChatbotWindow = useChatbotWindowStore((state) => state.closeChatbotWindow);
  const navigate = useNavigate();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: async (): Promise<void> => {
      await axiosPrivate.post('/auth/logout');
    },
  });

  const handleLogout = () => {
    closeChatWindow();
    closeChatbotWindow();
    clearAuth();
    navigate('/');
    logout();
  };

  return { logout: handleLogout, isPending };
};

export default useLogout;
