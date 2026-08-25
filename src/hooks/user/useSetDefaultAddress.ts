import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  const {
    mutate: setDefaultAddress,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (addressId: string) => {
      await axiosPrivate.patch(`/user/address/${addressId}/default`);
    },
    onSuccess: async () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { setDefaultAddress, isPending, errorMessage };
};

export default useSetDefaultAddress;
