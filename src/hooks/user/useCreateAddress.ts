import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type CreateAddressPayload = {
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
  fullAddressText: string;
  addressType: number;
  isDefault: boolean;
  isPickUpAddress: boolean;
};

export type CreateAddressResponse = {
  addressId: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
  fullAddressText: string;
  latitude: number | null;
  longitude: number | null;
  addressType: string;
};

const useCreateAddress = () => {
  const queryClient = useQueryClient();

  const {
    mutate: createAddress,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: CreateAddressPayload): Promise<CreateAddressResponse> => {
      const response = await axiosPrivate.post<CreateAddressResponse>('/user/address', payload);
      return response.data;
    },
    onSuccess: async () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { createAddress, isPending, errorMessage };
};

export default useCreateAddress;
