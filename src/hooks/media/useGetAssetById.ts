import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

export type GetAssetResponse = {
  bucket: string;
  contentType: string;
  createdAt: string;
  durationSeconds: number;
  height: number;
  id: string;
  mediaUrl: string;
  objectKey: string;
  publicUrl: string;
  sizeBytes: number;
  status: string;
  uploadedBy: string;
  width: number;
};

const useGetAssetById = (id: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: async (): Promise<GetAssetResponse> => {
      const response = await axiosPublic.get(`/media/assets/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetAssetById;
