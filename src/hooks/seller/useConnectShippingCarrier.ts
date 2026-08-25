import { useMutation } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type ConnectShippingCarrierPayload = {
  shopId: string;
  carrierId: string;
};

export type ConnectShippingCarrierResponse = {
  connectionId: string;
  status: number;
};

const useConnectShippingCarrier = () => {
  const {
    mutate: connectShippingCarrier,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (
      payload: ConnectShippingCarrierPayload,
    ): Promise<ConnectShippingCarrierResponse> => {
      const response = await axiosPrivate.post<ConnectShippingCarrierResponse>(
        '/seller/shop/shipping-carrier/connect',
        payload,
      );
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { connectShippingCarrier, isPending, errorMessage };
};

export default useConnectShippingCarrier;
