import { axiosPrivate } from '@/utils';
import { useQuery } from '@tanstack/react-query';

type GetProfileResponse = {
  displayName: string;
  avatarUrl: string | null;
  gender: number | null;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
};

const useGetProfile = (enabled = true) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<GetProfileResponse> => {
      const response = await axiosPrivate.get<GetProfileResponse>('/user/profile');
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetProfile;
