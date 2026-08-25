import { useMutation } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type RequestOtpPayload = {
  email: string;
  role: string;
};

const useRequestOtp = () => {
  const {
    mutate: requestOtp,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: RequestOtpPayload): Promise<void> => {
      await axiosPublic.post('/auth/request-otp', payload);
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { requestOtp, isPending, errorMessage };
};

export default useRequestOtp;
