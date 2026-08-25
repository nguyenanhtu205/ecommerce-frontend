import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetShopsForChatResponse = {
  id: string;
  name: string;
  shopAvatarUrl: string | null;
}[];

type GetShopsForChatPayload = {
  shopIds: string[];
};

const useGetShopsForChat = (payload: GetShopsForChatPayload, options?: { enabled?: boolean }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['shops-chat', payload],
    queryFn: async (): Promise<GetShopsForChatResponse> => {
      const response = await axiosPrivate.post<GetShopsForChatResponse>(
        'seller/shop/chat-information',
        payload,
      );
      return response.data;
    },
    enabled: (options?.enabled ?? true) && payload.shopIds.length > 0,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopsForChat;
