import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetOrderItemInfoResponse = {
  id: string;
  orderId: string;
  productName: string;
  thumbnailUrl: string;
  quantity: number;
}[];

type GetOrderItemInfoPayload = {
  orderItemIds: string[];
};

const useGetOrderItemInfo = (orderItemIds: string[]) => {
  const {
    data: orderItems,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['order', 'item-info', orderItemIds],

    queryFn: async (): Promise<GetOrderItemInfoResponse> => {
      const payload: GetOrderItemInfoPayload = { orderItemIds };

      const response = await axiosPrivate.post<GetOrderItemInfoResponse>(
        '/order/item-info',
        payload,
      );

      return response.data;
    },

    enabled: orderItemIds.length > 0,
  });

  const errorMessage = error
    ? ((
        error as {
          response?: {
            data?: {
              detail?: string;
            };
          };
        }
      ).response?.data?.detail ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    orderItems: orderItems ?? [],
    isLoading,
    isFetching,
    errorMessage,
  };
};

export default useGetOrderItemInfo;
