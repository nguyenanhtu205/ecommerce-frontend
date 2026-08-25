import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type Message = {
  id: string;
  conversationId: string;
  senderType: 'buyer' | 'shop';
  content: string;
  attachmentMediaAssetIds: string[];
  isRead: boolean;
  createdAt: string;
};

const PAGE_SIZE = 20;

const useGetMessages = (conversationId: string, options?: { enabled?: boolean }) => {
  const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['messages', conversationId],
      queryFn: async ({ pageParam }): Promise<Message[]> => {
        const response = await axiosPrivate.get<Message[]>(
          `chat/conversations/${conversationId}/messages`,
          { params: { page: pageParam } },
        );
        return response.data;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
      enabled: (options?.enabled ?? true) && !!conversationId,
    });

  const messages = data?.pages.flat() ?? [];

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return {
    messages,
    isPending,
    errorMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetMessages;
