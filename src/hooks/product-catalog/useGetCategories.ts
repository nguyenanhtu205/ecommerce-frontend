import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type GetCategoriesParams = {
  parentId?: string | null;
};

export type GetCategoriesResponse = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  path: {
    id: string;
    name: string;
  }[];
  level: number;
  isLeaf: boolean;
}[];

const useGetCategories = (params?: GetCategoriesParams) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['categories', params],
    queryFn: async (): Promise<GetCategoriesResponse> => {
      const response = await axiosPublic.get('/product-catalog/categories', {
        params,
      });
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetCategories;
