import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetCheckoutStatusPayload = {
  checkoutBatchId: string;
};

type CheckoutOrder = {
  orderId: string;
  status: string;
  merchandiseSubtotal: number;
  shippingFee: number;
  voucherDiscount: number;
  totalPayment: number;
};

export type GetCheckoutStatusResponse = {
  checkoutBatchId: string;
  sagaState: string;
  orders: CheckoutOrder[];
  totalAmount: number;
  redirectUrl: string | null;
  failReason: string | null;
};

const TERMINAL_SAGA_STATES = ['Completed', 'Cancelled'];

const useGetCheckoutStatus = (
  payload: GetCheckoutStatusPayload,
  options?: { enabled?: boolean },
) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['checkout-status', payload.checkoutBatchId],
    queryFn: async (): Promise<GetCheckoutStatusResponse> => {
      const response = await axiosPrivate.get<GetCheckoutStatusResponse>(
        `order/checkout/${payload.checkoutBatchId}/status`,
      );
      return response.data;
    },
    enabled: (options?.enabled ?? true) && !!payload.checkoutBatchId,
    refetchInterval: (query) => {
      const sagaState = query.state.data?.sagaState;
      if (sagaState && TERMINAL_SAGA_STATES.includes(sagaState)) {
        return false;
      }
      return 2000;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { title?: string; detail?: string } } }).response?.data
        ?.detail ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetCheckoutStatus;
