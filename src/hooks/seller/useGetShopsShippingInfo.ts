import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetShopsShippingInfoResponse = {
  id: string;
  province: string;
  ward: string;
  carrierCode: string[];
}[];

type GetShopsShippingInfoPayload = {
  shopIds: string[];
};

const useGetShopsShippingInfo = (
  payload: GetShopsShippingInfoPayload,
  options?: { enabled?: boolean },
) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['shops-shipping-info', payload],
    queryFn: async (): Promise<GetShopsShippingInfoResponse> => {
      const response = await axiosPrivate.post<GetShopsShippingInfoResponse>(
        '/seller/shop/shipping-information',
        payload,
      );
      return response.data;
    },
    enabled: (options?.enabled ?? true) && payload.shopIds.length > 0,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopsShippingInfo;
