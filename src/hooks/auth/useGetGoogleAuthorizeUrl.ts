import { useMutation } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type GetGoogleAuthorizeUrlResponse = {
  url: string;
};

const useGetGoogleAuthorizeUrl = () => {
  const {
    mutateAsync: getAuthorizeUrl,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (): Promise<GetGoogleAuthorizeUrlResponse> => {
      const response = await axiosPublic.get<GetGoogleAuthorizeUrlResponse>(
        '/auth/google/authorize-url',
      );
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { getAuthorizeUrl, isPending, errorMessage };
};

export default useGetGoogleAuthorizeUrl;
