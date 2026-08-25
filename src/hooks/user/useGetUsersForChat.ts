import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetUsersForChatResponse = [
  {
    id: string;
    name: string;
    userAvatarUrl: string | null;
  },
];

type GetUsersForChatPayload = {
  userIds: string[];
};

const useGetUsersForChat = (payload: GetUsersForChatPayload, options?: { enabled?: boolean }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['users-chat', payload],
    queryFn: async (): Promise<GetUsersForChatResponse> => {
      const response = await axiosPrivate.post<GetUsersForChatResponse>(
        'user/chat-information',
        payload,
      );
      return response.data;
    },
    enabled: (options?.enabled ?? true) && payload.userIds.length > 0,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetUsersForChat;
