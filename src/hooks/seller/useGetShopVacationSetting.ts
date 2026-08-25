import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type GetShopVacationSettingResponse = {
  isEnabled: boolean;
  startDate: string | null;
  endDate: string | null;
  message: string | null;
};

const useGetShopVacationSetting = () => {
  const { data, error, isPending } = useQuery({
    queryFn: async (): Promise<GetShopVacationSettingResponse> => {
      const response = await axiosPrivate.get<GetShopVacationSettingResponse>(
        '/seller/shop/vacation-setting',
      );
      return response.data;
    },
    queryKey: ['shop-vacation-setting'],
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopVacationSetting;
