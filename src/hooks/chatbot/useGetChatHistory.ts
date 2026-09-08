import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetChatHistoryResponse = {
  user_id: string;
  messages: {
    role: string;
    content: string;
  }[];
};

const useGetChatHistory = () => {
  const { data, isPending, error } = useQuery({
    queryFn: async (): Promise<GetChatHistoryResponse> => {
      const response = await axiosPrivate.get<GetChatHistoryResponse>('/chatbot/chat/history');
      return response.data;
    },
    queryKey: ['chatbot-chat-history'],
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetChatHistory;
