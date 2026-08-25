import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetAddressesResponse = {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
  fullAddressText: string;
  latitude: number | null;
  longitude: number | null;
  addressType: number;
  isDefault: boolean;
  isPickupAddress: boolean;
  createdAt: string;
}[];

const useGetAddresses = () => {
  const { data, isPending, error } = useQuery({
    queryFn: async (): Promise<GetAddressesResponse> => {
      const response = await axiosPrivate.get<GetAddressesResponse>('/user/addresses');
      return response.data;
    },
    queryKey: ['addresses'],
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetAddresses;
