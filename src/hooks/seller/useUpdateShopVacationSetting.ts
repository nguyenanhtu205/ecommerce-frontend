import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type UpdateShopVacationSettingPayload = {
  isEnabled: boolean;
  startDate: string | null;
  endDate: string | null;
  message: string | null;
};

const useUpdateShopVacationSetting = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateShopVacationSetting,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: UpdateShopVacationSettingPayload): Promise<void> => {
      await axiosPrivate.patch('/seller/shop/vacation-setting', payload);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop-vacation-setting'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { updateShopVacationSetting, isPending, errorMessage };
};

export default useUpdateShopVacationSetting;
