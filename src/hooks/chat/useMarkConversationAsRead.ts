import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async (conversationId: string): Promise<void> => {
      await axiosPrivate.post(`chat/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { markAsRead: mutate, markAsReadAsync: mutateAsync, isPending, errorMessage };
};

export default useMarkConversationAsRead;
