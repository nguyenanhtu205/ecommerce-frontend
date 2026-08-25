import { useMutation } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type ActivateShopPayload = {
  shopId: string;
  email: string;
};

const useActivateShop = () => {
  const {
    mutate: activateShop,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: ActivateShopPayload): Promise<void> => {
      await axiosPrivate.post('/seller/shop/activate', payload);
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { activateShop, isPending, errorMessage };
};

export default useActivateShop;
