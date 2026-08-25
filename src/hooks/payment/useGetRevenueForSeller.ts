import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type PaymentMethodType = number;

export type RevenueOverview = {
  pendingBalance: number;
  paidThisWeek: number;
  paidThisMonth: number;
  paidTotal: number;
  debtBalance: number;
};

export type UnpaidOrderItem = {
  orderId: string;
  buyerId: string;
  paymentMethod: PaymentMethodType;
  amount: number;
  releaseDueAt: string;
};

export type PaidOrderItem = {
  orderId: string;
  buyerId: string;
  paymentMethod: PaymentMethodType;
  amount: number;
  paidAt: string;
  refundedAmount: number;
};

export type GetRevenueForSellerResponse = {
  overview: RevenueOverview;
  unpaidOrders: UnpaidOrderItem[];
  paidOrders: PaidOrderItem[];
};

export type GetRevenueForSellerParams = {
  paidFrom?: string;
  paidTo?: string;
};

const useGetRevenueForSeller = ({ paidFrom, paidTo }: GetRevenueForSellerParams = {}) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['revenue-for-seller', paidFrom, paidTo],
    queryFn: async (): Promise<GetRevenueForSellerResponse> => {
      const response = await axiosPrivate.get<GetRevenueForSellerResponse>(`/payment/revenue`, {
        params: {
          PaidFrom: paidFrom,
          PaidTo: paidTo,
        },
      });
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetRevenueForSeller;
