import { useMutation } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type CalculateShippingFeePayload = {
  deliveryProvince: string;
  deliveryWard: string;
  shops: {
    shopId: string;
    carrierCode: string;
    pickupProvince: string;
    pickupWard: string;
    items: {
      combinationId: string;
      quantity: number;
      weightGram: number;
      length: number;
      width: number;
      height: number;
    }[];
  }[];
};

type CalculateShippingFeeResponse = {
  shopId: string;
  combinationId: string;
  isValid: boolean;
  fee: number;
  estimatedStart: string | null;
  estimatedEnd: string | null;
  failureReason: string | null;
}[];

const useCalculateShippingFee = () => {
  const {
    mutate: calculateShippingFee,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (
      payload: CalculateShippingFeePayload,
    ): Promise<CalculateShippingFeeResponse> => {
      const response = await axiosPrivate.post<CalculateShippingFeeResponse>(
        '/shipping/fee',
        payload,
      );
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { calculateShippingFee, isPending, errorMessage };
};

export default useCalculateShippingFee;
