import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';
import type { Message } from './useGetMessages';
import { useAuthStore } from '@/stores';

type Attachment = {
  mediaAssetId: string;
  role: 'chat_image' | 'chat_video';
};

type SendMessagePayload = {
  content?: string;
  attachments?: Attachment[];
};

const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async (payload: SendMessagePayload): Promise<Message> => {
      const response = await axiosPrivate.post<Message>(
        `chat/conversations/${conversationId}/messages`,
        payload,
      );
      return response.data;
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      const senderType: Message['senderType'] =
        useAuthStore.getState().user?.role?.[0] === 'seller' ? 'shop' : 'buyer';

      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage: Message & { isOptimistic?: boolean } = {
        id: optimisticId,
        conversationId,
        senderType,
        content: payload.content ?? '',
        attachmentMediaAssetIds: payload.attachments?.map((a) => a.mediaAssetId) ?? [],
        isRead: false,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData(['messages', conversationId], (old: any) => {
        if (!old) return old;
        const pages = [...old.pages];
        pages[0] = [optimisticMessage, ...pages[0]];
        return { ...old, pages };
      });

      return { optimisticId };
    },

    onSuccess: (realMessage, _payload, context) => {
      queryClient.setQueryData(['messages', conversationId], (old: any) => {
        if (!old) return old;

        const alreadyDeliveredByWs = old.pages.some((page: Message[]) =>
          page.some((m) => m.id === realMessage.id),
        );

        if (alreadyDeliveredByWs) {
          const pages = old.pages.map((page: Message[]) =>
            page.filter((m) => m.id !== context?.optimisticId),
          );
          return { ...old, pages };
        }

        const pages = old.pages.map((page: Message[]) =>
          page.map((m) => (m.id === context?.optimisticId ? realMessage : m)),
        );
        return { ...old, pages };
      });

      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },

    onError: (_err, _payload, context) => {
      queryClient.setQueryData(['messages', conversationId], (old: any) => {
        if (!old) return old;
        const pages = old.pages.map((page: Message[]) =>
          page.filter((m) => m.id !== context?.optimisticId),
        );
        return { ...old, pages };
      });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { sendMessage: mutate, sendMessageAsync: mutateAsync, isPending, errorMessage };
};

export default useSendMessage;
