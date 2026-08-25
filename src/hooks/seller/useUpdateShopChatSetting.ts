import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type UpdateShopChatSettingPayload = {
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
};

const useUpdateShopChatSetting = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async (payload: UpdateShopChatSettingPayload): Promise<void> => {
      await axiosPrivate.put(`/seller/shop/chat-setting`, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop-chat-setting'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    updateShopChatSetting: mutate,
    updateShopChatSettingAsync: mutateAsync,
    isPending,
    errorMessage,
  };
};

export default useUpdateShopChatSetting;
