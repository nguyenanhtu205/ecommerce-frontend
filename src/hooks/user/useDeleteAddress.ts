import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  const {
    mutate: deleteAddress,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (addressId: string) => {
      await axiosPrivate.delete(`/user/address/${addressId}`);
    },
    onSuccess: async () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { deleteAddress, isPending, errorMessage };
};

export default useDeleteAddress;
