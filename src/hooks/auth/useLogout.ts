import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useChatWindowStore } from '@/stores';
import { axiosPrivate } from '@/utils';

const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const closeChatWindow = useChatWindowStore((state) => state.closeChatWindow);
  const navigate = useNavigate();

  const handleLogout = () => {
    closeChatWindow();
    clearAuth();
    navigate('/');
  };

  const { mutate: logout, isPending } = useMutation({
    mutationFn: async (): Promise<void> => {
      await axiosPrivate.post('/auth/logout');
    },
    onSuccess: handleLogout,
    onError: handleLogout,
  });

  return { logout, isPending };
};

export default useLogout;
