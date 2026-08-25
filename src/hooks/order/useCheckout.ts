import { useMutation } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type CheckoutPayload = {
  cartItems: {
    combinationId: string;
    quantity: number;
    variation: string;
  }[];
  shopInfos: {
    shopId: string;
    carrierCode: string;
    shopVoucherCode: string | null;
    note: string | null;
  }[];
  shippingAddressId: string;
  paymentMethod: string;
  platformVoucherCode: string | null;
};

type CheckoutResponse = {
  success: boolean;
  checkoutBatchId: string;
  orderIds: string[];
  totalAmount: string | null;
  redirectUrl: string | null;
  failureReason: string | null;
};

const useCheckout = () => {
  const {
    mutate: checkout,
    isPending,
    error,
    reset,
  } = useMutation({
    mutationFn: async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
      const response = await axiosPrivate.post<CheckoutResponse>('/order/checkout', payload);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { checkout, isPending, errorMessage, reset };
};

export default useCheckout;
