import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  thumbnail: string;
  variation: string | null;
  quantity: number;
  price: number;
  originalPrice: number | null;
};

type Order = {
  id: string;
  shopId: string;
  shopName: string;
  status: string;
  merchandiseSubtotal: number;
  shippingFee: number;
  totalDiscount: number;
  xuDiscount: number;
  totalPayment: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type GetOrdersByUserResponse = Order[];

const useGetOrdersByUser = (options?: { enabled?: boolean }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['orders-by-user'],
    queryFn: async (): Promise<GetOrdersByUserResponse> => {
      const response = await axiosPrivate.get<GetOrdersByUserResponse>('order/user');
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetOrdersByUser;
