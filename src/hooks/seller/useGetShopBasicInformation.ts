import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetShopBasicInformationResponse = {
  name: string | null;
  description: string | null;
  shopAvatarUrl: string | null;
};

const useGetShopBasicInformation = () => {
  const { data, isPending, error } = useQuery({
    queryFn: async (): Promise<GetShopBasicInformationResponse> => {
      const response = await axiosPrivate.get<GetShopBasicInformationResponse>(
        '/seller/shop/basic-information',
      );
      return response.data;
    },
    queryKey: ['shop-basic-information'],
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopBasicInformation;
