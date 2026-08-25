import { useMutation } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type ConfirmUploadPathParams = {
  id: string;
};

type ConfirmUploadPayload = {
  durationSeconds?: number;
  height?: number;
  width?: number;
};

export type ConfirmUploadResponse = {
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

type ConfirmUploadVariables = ConfirmUploadPathParams & ConfirmUploadPayload;

const useConfirmUpload = () => {
  const { mutate, mutateAsync, isPending, error, data } = useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ConfirmUploadVariables): Promise<ConfirmUploadResponse> => {
      const response = await axiosPrivate.post(`/media/uploads/${id}/confirm`, payload);
      return response.data;
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Xác nhận upload thất bại. Vui lòng thử lại.')
    : null;

  return { confirmUpload: mutate, confirmUploadAsync: mutateAsync, isPending, errorMessage, data };
};

export default useConfirmUpload;
