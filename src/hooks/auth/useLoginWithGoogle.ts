import { useAuthStore } from '@/stores';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axiosPublic } from '@/utils';
import { jwtDecode } from 'jwt-decode';
import type { User } from '@/types';

type LoginWithGooglePayload = {
  authorizationCode: string;
  state: string;
  role: string;
};

type LoginWithGoogleResponse = {
  accessToken: string;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: string | string[];
  shop_id?: string;
};

const useLoginWithGoogle = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    mutate: loginWithGoogle,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: LoginWithGooglePayload): Promise<LoginWithGoogleResponse> => {
      const response = await axiosPublic.post<LoginWithGoogleResponse>(
        '/auth/google/login',
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      const decoded = jwtDecode<JwtPayload>(data.accessToken);

      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        role: Array.isArray(decoded.role) ? decoded.role : [decoded.role],
        shopId: decoded.shop_id,
        hasShop: !!decoded.shop_id,
      };

      setAuth(user, data.accessToken);

      const primaryRole = user.role[0];
      if (primaryRole === 'seller') {
        navigate(user.hasShop ? '/seller' : '/seller/onboarding', { replace: true });
        return;
      }
      navigate('/', { replace: true });
    },
    onError: () => {
      alert('Đăng nhập thất bại. Vui lòng thử lại.');
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Đăng nhập thất bại. Vui lòng thử lại.')
    : null;

  return { loginWithGoogle, isPending, errorMessage };
};

export default useLoginWithGoogle;
