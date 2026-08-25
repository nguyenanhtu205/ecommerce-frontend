import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type ChatQuickReplyItem = {
  id: string;
  title: string;
  content: string;
};

export type GetShopChatQuickRepliesResponse = ChatQuickReplyItem[];

const useGetShopChatQuickReplies = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['shop-chat-quick-replies'],
    queryFn: async (): Promise<GetShopChatQuickRepliesResponse> => {
      const response = await axiosPrivate.get<GetShopChatQuickRepliesResponse>(
        `/seller/shop/chat-quick-replies`,
      );
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopChatQuickReplies;
