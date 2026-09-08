import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type AskQuestionPayload = {
  question: string;
};

type AskQuestionResponse = {
  answer: string;
  sources: {
    source: string;
    chunk_index: number;
    snippet: string;
    score: number;
  }[];
};

type ChatMessage = { role: string; content: string };

type GetChatHistoryResponse = {
  user_id: string;
  messages: ChatMessage[];
};

const GENERIC_ERROR_MESSAGE = 'Có lỗi xảy ra. Vui lòng thử lại.';

const useAskQuestion = () => {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, data, isPending, error } = useMutation({
    mutationFn: async (payload: AskQuestionPayload): Promise<AskQuestionResponse> => {
      const response = await axiosPrivate.post<AskQuestionResponse>('/chatbot/chat/ask', payload);
      return response.data;
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['chatbot-chat-history'] });

      queryClient.setQueryData<GetChatHistoryResponse>(['chatbot-chat-history'], (old) => {
        const base = old ?? { user_id: '', messages: [] };
        return {
          ...base,
          messages: [...base.messages, { role: 'user', content: payload.question }],
        };
      });
    },

    onSuccess: (response) => {
      queryClient.setQueryData<GetChatHistoryResponse>(['chatbot-chat-history'], (old) => {
        const base = old ?? { user_id: '', messages: [] };
        return {
          ...base,
          messages: [...base.messages, { role: 'assistant', content: response.answer }],
        };
      });
    },

    onError: () => {
      queryClient.setQueryData<GetChatHistoryResponse>(['chatbot-chat-history'], (old) => {
        const base = old ?? { user_id: '', messages: [] };
        return {
          ...base,
          messages: [...base.messages, { role: 'assistant', content: GENERIC_ERROR_MESSAGE }],
        };
      });
    },
  });

  const errorMessage = error ? GENERIC_ERROR_MESSAGE : null;

  return { mutate, mutateAsync, data, isPending, errorMessage };
};

export default useAskQuestion;
