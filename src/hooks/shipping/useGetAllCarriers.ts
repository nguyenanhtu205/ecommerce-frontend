import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetAllCarriersResponse = {
  carrierId: string;
  code: string;
  name: string;
}[];

const useGetAllCarriers = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['all-carriers'],
    queryFn: async (): Promise<GetAllCarriersResponse> => {
      const response = await axiosPrivate.get<GetAllCarriersResponse>('/shipping/carriers');
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetAllCarriers;
