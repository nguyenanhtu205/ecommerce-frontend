import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type CreateConversationPayload = {
  shopId: string;
};

export type Conversation = {
  id: string;
  buyerId: string;
  shopId: string;
  lastMessage: string;
  lastMessageAt: string;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  createdAt: string;
};

const useCreateConversation = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async (payload: CreateConversationPayload): Promise<Conversation> => {
      const response = await axiosPrivate.post<Conversation>('chat/conversations', payload);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    createConversation: mutate,
    createConversationAsync: mutateAsync,
    isPending,
    errorMessage,
  };
};

export default useCreateConversation;
