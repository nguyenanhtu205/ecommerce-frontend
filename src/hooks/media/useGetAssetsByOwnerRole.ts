import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/utils';

type OwnerRoleItem = {
  ownerId: string;
  role: string;
};

type GetAssetsByOwnerRolePayload = {
  ownerService: string;
  ownerType: string;
  items: OwnerRoleItem[];
};

export type GetAssetsByOwnerRoleResponse = {
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
    ownerId: string;
    role: string;
  }[];
};

const useGetAssetsByOwnerRole = (
  payload: GetAssetsByOwnerRolePayload,
  options?: { enabled?: boolean },
) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['assets-by-owner-role', payload],
    queryFn: async (): Promise<GetAssetsByOwnerRoleResponse> => {
      const response = await axiosPublic.post<GetAssetsByOwnerRoleResponse>(
        '/media/assets/by-owner-role/bulk',
        payload,
      );
      return response.data;
    },
    enabled: (options?.enabled ?? true) && payload.items.length > 0,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetAssetsByOwnerRole;
