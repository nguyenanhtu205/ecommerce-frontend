import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type GetCategoryAttributesResponse = {
  id: string;
  categoryId: string;
  name: string;
  required: boolean;
  inputType: string;
  options: string[];
  completionWeight: number;
  sortOrder: number;
}[];

const useGetCategoryAttributes = (categoryId: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['category-attributes', categoryId],
    queryFn: async (): Promise<GetCategoryAttributesResponse> => {
      const response = await axiosPublic.get(
        `/product-catalog/categories/${categoryId}/attributes`,
      );
      return response.data;
    },
    enabled: !!categoryId,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetCategoryAttributes;
