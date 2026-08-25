import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export const WalletTransactionType = {
  EscrowRelease: 0,
  Withdrawal: 1,
  RefundDeduction: 2,
  DebtIncrease: 3,
  DebtSettlement: 4,
} as const;

export type WalletTransactionType =
  (typeof WalletTransactionType)[keyof typeof WalletTransactionType];

export type AccountBalanceOverview = {
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  debtBalance: number;
};

export type WalletTransactionItem = {
  id: string;
  createdAt: string;
  type: WalletTransactionType;
  orderId: string | null;
  flow: 'in' | 'out';
  amount: number;
  status: string;
};

export type GetAccountBalanceResponse = {
  overview: AccountBalanceOverview;
  transactions: WalletTransactionItem[];
  totalCount: number;
  totalAmount: number;
};

export type GetAccountBalanceParams = {
  from?: string;
  to?: string;
  flow?: 'in' | 'out';
  types?: WalletTransactionType[];
  orderIdSearch?: string;
  page?: number;
  pageSize?: number;
};

const useGetAccountBalance = ({
  from,
  to,
  flow,
  types,
  orderIdSearch,
  page = 1,
  pageSize = 20,
}: GetAccountBalanceParams = {}) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['account-balance', from, to, flow, types, orderIdSearch, page, pageSize],
    queryFn: async (): Promise<GetAccountBalanceResponse> => {
      const response = await axiosPrivate.post<GetAccountBalanceResponse>(
        `/payment/account-balance`,
        {
          from,
          to,
          flow,
          types,
          orderIdSearch,
          page,
          pageSize,
        },
      );
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetAccountBalance;
