import { useMutation } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type CreateShopPayload = {
  name: string;
  email: string;
  pickupAddressId: string;
  pickupAddressSnapshot: {
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
};

export type CreateShopResponse = {
  shopId: string;
};

const useCreateShop = () => {
  const {
    mutate: createShop,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: CreateShopPayload): Promise<CreateShopResponse> => {
      const response = await axiosPrivate.post<CreateShopResponse>('/seller/shop', payload);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { createShop, isPending, errorMessage };
};

export default useCreateShop;
