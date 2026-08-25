import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type GetCategorySidebarResponse = {
  parent: {
    id: string;
    name: string;
    slug: string;
    isLeaf: boolean;
  };
  items: {
    id: string;
    name: string;
    slug: string;
    isLeaf: boolean;
  }[];
  activeSlug: string;
};

const useGetCategorySidebar = (slug: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['category-sidebar', slug],
    queryFn: async (): Promise<GetCategorySidebarResponse> => {
      const response = await axiosPublic.get(`/product-catalog/categories/sidebar/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetCategorySidebar;
