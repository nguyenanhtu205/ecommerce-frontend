import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type UpdateShopChatQuickReplyPayload = {
  id: string;
  title: string;
  content: string;
};

const useUpdateShopChatQuickReply = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async (payload: UpdateShopChatQuickReplyPayload): Promise<void> => {
      await axiosPrivate.put(`/seller/shop/chat-quick-reply`, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop-chat-quick-replies'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { updateQuickReply: mutate, updateQuickReplyAsync: mutateAsync, isPending, errorMessage };
};

export default useUpdateShopChatQuickReply;
