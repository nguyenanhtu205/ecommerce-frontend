import { useMutation } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/stores';
import type { User } from '@/types';
import { axiosPublic } from '@/utils';

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: string | string[];
  shop_id?: string;
};

const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: LoginPayload): Promise<LoginResponse> => {
      const response = await axiosPublic.post<LoginResponse>('/auth/login', payload);
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
      'Đăng nhập thất bại. Vui lòng thử lại.')
    : null;

  return { login, isPending, errorMessage };
};

export default useLogin;
