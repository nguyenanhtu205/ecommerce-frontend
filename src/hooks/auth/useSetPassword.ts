import { useAuthStore } from '@/stores';
import { useMutation } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';
import { jwtDecode } from 'jwt-decode';
import type { User } from '@/types';

type SetPasswordPayload = {
  email: string;
  password: string;
};

type SetPasswordResponse = {
  accessToken: string;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: string | string[];
  shop_id?: string;
};

const useSetPassword = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    mutate: setPassword,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: SetPasswordPayload): Promise<SetPasswordResponse> => {
      const response = await axiosPublic.post<SetPasswordResponse>('/auth/set-password', payload);
      return response.data;
    },
    onSuccess: (data) => {
      const decoded = jwtDecode<JwtPayload>(data.accessToken);

      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        role: Array.isArray(decoded.role) ? decoded.role : [decoded.role],
        shopId: decoded.shop_id,
      };

      setAuth(user, data.accessToken);
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { setPassword, isPending, errorMessage };
};

export default useSetPassword;
