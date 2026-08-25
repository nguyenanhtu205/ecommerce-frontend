import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type GetMultipleAssetsPayload = {
  assetIds: string[];
};

export type GetMultipleAssetsResponse = {
  items: {
    asset: {
      bucket: string;
      contentType: string;
      createdAt: string;
      durationSeconds: number;
      height: number;
      id: string;
      mediaType: string;
      objectKey: string;
      publicUrl: string;
      sizeBytes: number;
      status: string;
      uploadedBy: string;
      width: number;
    };
    found: boolean;
    id: string;
  }[];
};

const useGetMultipleAssets = (
  payload: GetMultipleAssetsPayload,
  options?: { enabled?: boolean },
) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['multiple-assets', payload],
    queryFn: async (): Promise<GetMultipleAssetsResponse> => {
      const response = await axiosPublic.post<GetMultipleAssetsResponse>(
        'media/assets/bulk',
        payload,
      );
      return response.data;
    },
    enabled: (options?.enabled ?? true) && payload.assetIds.length > 0,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetMultipleAssets;
