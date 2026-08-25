import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type CreateShopChatQuickReplyPayload = {
  title: string;
  content: string;
};

const useCreateShopChatQuickReply = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async (payload: CreateShopChatQuickReplyPayload): Promise<void> => {
      await axiosPrivate.post(`/seller/shop/chat-quick-reply`, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shop-chat-quick-replies'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { createQuickReply: mutate, createQuickReplyAsync: mutateAsync, isPending, errorMessage };
};

export default useCreateShopChatQuickReply;
