import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type ShopVacation = {
  isEnabled: boolean;
  startDate: string;
  endDate: string;
  message: string;
} | null;

export type GetShopInformationForBuyerResponse = {
  name: string;
  shopVacation: ShopVacation;
  createdAt: string;
  location: string;
  carrierCodes: string[];
  description: string | null;
  shopAvatarUrl: string | null;
};

const useGetShopInformationForBuyer = (shopId: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['shop-information-for-buyer', shopId],
    queryFn: async (): Promise<GetShopInformationForBuyerResponse> => {
      const response = await axiosPublic.get(`/seller/shop/public-information/${shopId}`);
      return response.data;
    },
    enabled: !!shopId,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopInformationForBuyer;
