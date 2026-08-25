import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type CategoryPathItem = {
  id: string;
  slug: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  path: CategoryPathItem[];
  level: number;
  isLeaf: boolean;
};

export type GetAllCategoriesResponse = Category[];

const useGetAllCategories = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['all-categories'],
    queryFn: async (): Promise<GetAllCategoriesResponse> => {
      const response = await axiosPublic.get(`/product-catalog/categories/all`);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetAllCategories;
