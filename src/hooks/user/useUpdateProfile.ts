import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

type UpdateProfilePayload = {
  displayName: string | null;
  avatarUrl: string | null;
  gender: number | null;
  dateOfBirth: string | null;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateProfile,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (payload: UpdateProfilePayload): Promise<void> => {
      await axiosPrivate.patch('/user/profile', payload);
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { updateProfile, isPending, errorMessage };
};

export default useUpdateProfile;
