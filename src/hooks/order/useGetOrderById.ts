import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetOrderByIdResponse = {
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
  items: {
    id: string;
    productId: string;
    productName: string;
    thumbnail: string;
    variation: string | null;
    quantity: number;
    price: number;
    originalPrice: string | null;
  }[];
};

const useGetOrderById = (id: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<GetOrderByIdResponse> => {
      const response = await axiosPrivate.get<GetOrderByIdResponse>(`/order/${id}`);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetOrderById;
