import { useMutation } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type RequestUploadPayload = {
  checksum?: string;
  contentType: string;
  mediaType: string;
};

export type RequestUploadResponse = {
  assetId: string;
  bucket: string;
  expiresInSeconds: number;
  objectKey: string;
  uploadUrl: string;
};

const useRequestUpload = () => {
  const { mutate, mutateAsync, isPending, error, data } = useMutation({
    mutationFn: async (payload: RequestUploadPayload): Promise<RequestUploadResponse> => {
      const response = await axiosPrivate.post('/media/uploads', payload);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Tạo yêu cầu upload thất bại. Vui lòng thử lại.')
    : null;

  return { requestUpload: mutate, requestUploadAsync: mutateAsync, isPending, errorMessage, data };
};

export default useRequestUpload;
