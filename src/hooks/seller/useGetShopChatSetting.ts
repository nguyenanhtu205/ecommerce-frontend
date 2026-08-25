import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type GetShopChatSettingResponse = {
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
};

const useGetShopChatSetting = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['shop-chat-setting'],
    queryFn: async (): Promise<GetShopChatSettingResponse> => {
      const response =
        await axiosPrivate.get<GetShopChatSettingResponse>(`/seller/shop/chat-setting`);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShopChatSetting;
