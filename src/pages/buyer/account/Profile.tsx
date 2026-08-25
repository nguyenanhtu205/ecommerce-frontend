import { useEffect, useState, type SubmitEvent, type ReactNode, type ChangeEvent } from 'react';
import {
  useGetProfile,
  useUpdateProfile,
  useRequestUpload,
  useConfirmUpload,
  useGetAssetById,
} from '@/hooks';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

const GENDER_MAP: Record<number, 'male' | 'female' | 'other'> = {
  0: 'male',
  1: 'female',
  2: 'other',
};

const REVERSE_GENDER_MAP: Record<'male' | 'female' | 'other', number> = {
  male: 0,
  female: 1,
  other: 2,
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const MAX_AVATAR_SIZE = 1024 * 1024;
const PUT_MAX_RETRIES = 2;

async function putFileToUploadUrl(uploadUrl: string, file: File, attempt = 1): Promise<void> {
  let res: Response;

  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  } catch (err) {
    if (attempt >= PUT_MAX_RETRIES) throw err;
    return putFileToUploadUrl(uploadUrl, file, attempt + 1);
  }

  if (!res.ok) {
    if (attempt >= PUT_MAX_RETRIES) {
      throw new Error(`Upload thất bại (status ${res.status})`);
    }
    return putFileToUploadUrl(uploadUrl, file, attempt + 1);
  }
}

function AvatarPreview({
  previewBlobUrl,
  assetId,
  alt,
}: {
  previewBlobUrl: string | null;
  assetId: string | null;
  alt: string;
}) {
  const shouldFetchAsset = !previewBlobUrl && !!assetId;
  const { data: asset, isPending: isAssetPending } = useGetAssetById(
    shouldFetchAsset ? assetId! : '',
  );

  const displayUrl = previewBlobUrl ?? asset?.publicUrl ?? null;
  const isLoading = shouldFetchAsset && isAssetPending;

  if (isLoading) {
    return <div className='h-full w-full animate-pulse bg-slate-200' />;
  }

  if (!displayUrl) {
    return (
      <svg
        width='48'
        height='48'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      >
        <circle cx='12' cy='8' r='4' />
        <path d='M4 21c0-4 3.6-7 8-7s8 3 8 7' />
      </svg>
    );
  }

  return <img src={displayUrl} alt={alt} className='h-full w-full object-cover' />;
}

export default function Profile() {
  const { data, isPending: isProfilePending } = useGetProfile();
  const { updateProfile, isPending: isSaving, errorMessage: saveError } = useUpdateProfile();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [avatarAssetId, setAvatarAssetId] = useState<string | null>(null);
  const [avatarPreviewBlob, setAvatarPreviewBlob] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const { requestUploadAsync } = useRequestUpload();
  const { confirmUploadAsync } = useConfirmUpload();

  useEffect(() => {
    if (!data) return;

    setName(data.displayName ?? '');
    setAvatarAssetId(data.avatarUrl ?? null);
    setAvatarPreviewBlob(null);

    setGender(data.gender != null ? (GENDER_MAP[data.gender] ?? '') : '');

    if (data.dateOfBirth) {
      const [y, m, d] = data.dateOfBirth.split('-');
      setYear(String(Number(y)));
      setMonth(String(Number(m)));
      setDay(String(Number(d)));
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [data]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setAvatarError('Chỉ chấp nhận ảnh JPEG hoặc PNG.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Dung lượng file tối đa 1 MB.');
      return;
    }

    setAvatarError(null);
    setUploadingAvatar(true);

    const localUrl = URL.createObjectURL(file);
    setAvatarPreviewBlob(localUrl);

    try {
      const { assetId, uploadUrl } = await requestUploadAsync({
        contentType: file.type,
        mediaType: 'IMAGE',
      });

      await putFileToUploadUrl(uploadUrl, file);

      const confirmed = await confirmUploadAsync({ id: assetId });

      setAvatarAssetId(confirmed.id);
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setAvatarPreviewBlob(null);
      setAvatarError(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
          'Tải ảnh lên thất bại. Vui lòng thử lại.',
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const originalGender = data?.gender != null ? GENDER_MAP[data.gender] : '';

  const [originalYear, originalMonth, originalDay] = data?.dateOfBirth
    ? data.dateOfBirth.split('-')
    : [null, null, null];

  const nameChanged = name !== (data?.displayName ?? '');
  const genderChanged = gender !== originalGender;
  const dobChanged =
    day !== (originalDay ? String(Number(originalDay)) : '') ||
    month !== (originalMonth ? String(Number(originalMonth)) : '') ||
    year !== (originalYear ? String(Number(originalYear)) : '');
  const avatarChanged = avatarAssetId !== (data?.avatarUrl ?? null);

  const isDirty = nameChanged || genderChanged || dobChanged || avatarChanged;

  const handleSave = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isDirty) return;

    const dateOfBirth =
      dobChanged && day && month && year
        ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        : null;

    updateProfile({
      displayName: nameChanged ? name : null,
      gender: genderChanged && gender ? REVERSE_GENDER_MAP[gender] : null,
      dateOfBirth,
      avatarUrl: avatarChanged ? avatarAssetId : null,
    });
  };

  const canSubmit = isDirty && !isSaving && !uploadingAvatar;

  return (
    <div className='rounded-sm bg-white p-8 shadow-sm'>
      <h1 className='text-lg font-medium text-slate-800'>Hồ Sơ Của Tôi</h1>
      <p className='mt-1 text-sm text-slate-400'>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      <div className='mt-4 border-b border-slate-100' />

      {isProfilePending ? (
        <ProfileSkeleton />
      ) : (
        <div className='flex flex-col gap-10 pt-8 md:flex-row'>
          <form onSubmit={handleSave} className='flex-3 space-y-6'>
            <Field label='Tên'>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D]'
              />
            </Field>

            <Field label='Giới tính'>
              <div className='flex h-10 items-center'>
                <div className='flex gap-6 text-sm text-slate-600'>
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <label key={g} className='flex items-center gap-1.5'>
                      <input
                        type='radio'
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className='accent-[#EE4D2D]'
                      />
                      {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                    </label>
                  ))}
                </div>
              </div>
            </Field>

            <Field label='Ngày sinh'>
              <div className='flex gap-3'>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className='rounded-sm border border-slate-300 px-2 py-2 text-sm text-slate-500 outline-none'
                >
                  <option value=''>Ngày</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className='rounded-sm border border-slate-300 px-2 py-2 text-sm text-slate-500 outline-none'
                >
                  <option value=''>Tháng</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className='rounded-sm border border-slate-300 px-2 py-2 text-sm text-slate-500 outline-none'
                >
                  <option value=''>Năm</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            {saveError && <p className='text-sm text-red-500'>{saveError}</p>}

            <button
              type='submit'
              disabled={!canSubmit}
              className='cursor-pointer rounded-sm bg-[#EE4D2D] px-10 py-2.5 text-sm font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </form>

          <div className='flex flex-1 flex-col items-center gap-3 border-l border-slate-100 pl-10'>
            <div className='flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-300'>
              <AvatarPreview
                previewBlobUrl={avatarPreviewBlob}
                assetId={avatarAssetId}
                alt={name || 'avatar'}
              />
            </div>
            <label
              className={`rounded-sm border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50 ${
                uploadingAvatar ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
            >
              {uploadingAvatar ? 'Đang tải...' : 'Chọn Ảnh'}
              <input
                type='file'
                accept='.jpeg,.jpg,.png'
                className='hidden'
                disabled={uploadingAvatar}
                onChange={handleAvatarChange}
              />
            </label>
            {avatarError && <p className='text-center text-xs text-red-500'>{avatarError}</p>}
            <p className='text-center text-xs text-slate-400'>
              Dung lượng file tối đa 1 MB
              <br />
              Định dạng: .JPEG, .PNG
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className='flex flex-col gap-10 pt-8 md:flex-row'>
      <div className='flex-3 space-y-6'>
        <SkeletonField />
        <SkeletonField />
        <SkeletonField />
        <div className='ml-38 h-10 w-32 animate-pulse rounded-sm bg-slate-200' />
      </div>
      <div className='flex flex-1 flex-col items-center gap-3 border-l border-slate-100 pl-10'>
        <div className='h-28 w-28 animate-pulse rounded-full bg-slate-200' />
        <div className='h-8 w-24 animate-pulse rounded-sm bg-slate-200' />
      </div>
    </div>
  );
}

function SkeletonField() {
  return (
    <div className='flex items-start gap-6'>
      <span className='w-32 shrink-0' />
      <div className='h-10 w-full max-w-xs animate-pulse rounded-sm bg-slate-200' />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex items-start gap-6'>
      <span className='w-32 shrink-0 pt-2 text-right text-sm text-slate-500'>{label}</span>
      <div className='flex-1'>{children}</div>
    </div>
  );
}
