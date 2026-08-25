import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type Conversation = {
  id: string;
  buyerId: string;
  shopId: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderType: 'buyer' | 'shop' | '';
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  createdAt: string;
};

export type GetConversationsResponse = Conversation[];

const useGetConversations = (options?: { enabled?: boolean }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<GetConversationsResponse> => {
      const response = await axiosPrivate.get<GetConversationsResponse>('chat/conversations');
      return response.data;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: 10000,
    // refetchIntervalInBackground: false,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetConversations;
