import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type UpdateAdressPayload = {
  id: string;
  fullName: string | null;
  phone: string | null;
  province: string | null;
  ward: string | null;
  addressDetail: string | null;
  fullAddressText: string | null;
  latitude: number | null;
  longitude: number | null;
  addressType: 0 | 1;
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateAddress,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: UpdateAdressPayload) => {
      await axiosPrivate.patch('/user/address', payload);
    },

    onSuccess: async () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { updateAddress, isPending, errorMessage };
};

export default useUpdateAddress;
