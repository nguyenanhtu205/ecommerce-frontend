import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type UpdateShopBasicInformationPayload = {
  name: string | null;
  description: string | null;
  shopAvatarUrl: string | null;
};

const useUpdateShopBasicInformation = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateShopBasicInformation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: UpdateShopBasicInformationPayload): Promise<void> => {
      await axiosPrivate.patch('/seller/shop/basic-information', payload);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop-basic-information'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { updateShopBasicInformation, isPending, errorMessage };
};

export default useUpdateShopBasicInformation;
