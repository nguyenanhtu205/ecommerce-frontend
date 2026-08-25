import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type SearchTrendingPayload = {
  limit?: number;
};

export type SearchTrendingResponse = {
  items: {
    keyword: string;
    score: number;
  }[];
};

const useSearchTrending = (payload: SearchTrendingPayload) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['search-trending', payload],
    queryFn: async (): Promise<SearchTrendingResponse> => {
      const response = await axiosPublic.get('/search/trending', { params: payload });
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Tải từ khoá thịnh hành thất bại. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useSearchTrending;
