import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type SearchSuggestPayload = {
  q: string;
};

export type SearchSuggestResponse = {
  suggestions: string[];
};

const useSearchSuggest = (payload: SearchSuggestPayload) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['search-suggest', payload],
    queryFn: async (): Promise<SearchSuggestResponse> => {
      const response = await axiosPublic.get('/search/suggest', { params: payload });
      return response.data;
    },
    enabled: payload.q.trim().length > 0,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Gợi ý tìm kiếm thất bại. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useSearchSuggest;
