import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type GetUserResponse = {
  email: string;
  shopName: string | null;
  createdAt: string;
};

const useGetUser = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<GetUserResponse> => {
      const response = await axiosPrivate.get<GetUserResponse>(`/auth/user`);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetUser;
