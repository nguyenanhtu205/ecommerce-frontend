import { useMutation } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type VerifyOtpPayload = {
  email: string;
  otp: string;
};

const useVerifyOtp = () => {
  const {
    mutate: verifyOtp,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: VerifyOtpPayload): Promise<void> => {
      await axiosPublic.post('/auth/verify-otp', payload);
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { verifyOtp, isPending, errorMessage };
};

export default useVerifyOtp;
