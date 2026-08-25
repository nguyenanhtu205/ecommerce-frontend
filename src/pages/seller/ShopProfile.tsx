import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  useGetShopBasicInformation,
  useUpdateShopBasicInformation,
  useRequestUpload,
  useConfirmUpload,
  useGetAssetById,
} from '@/hooks';

const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
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

function LogoPreview({
  previewBlobUrl,
  assetId,
}: {
  previewBlobUrl: string | null;
  assetId: string | null;
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
      <div className='flex h-full w-full items-center justify-center text-slate-300'>
        <svg
          width='32'
          height='32'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
        >
          <circle cx='12' cy='8' r='4' />
          <path d='M4 20c0-4 3.5-6 8-6s8 2 8 6' />
        </svg>
      </div>
    );
  }

  return <img src={displayUrl} alt='Logo Shop' className='h-full w-full object-cover' />;
}

export default function ShopProfile() {
  const { data, isPending: isShopPending } = useGetShopBasicInformation();
  const {
    updateShopBasicInformation,
    isPending: isSaving,
    errorMessage: saveError,
  } = useUpdateShopBasicInformation();

  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');

  const [logoAssetId, setLogoAssetId] = useState<string | null>(null);
  const [logoPreviewBlob, setLogoPreviewBlob] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { requestUploadAsync } = useRequestUpload();
  const { confirmUploadAsync } = useConfirmUpload();

  useEffect(() => {
    if (!data) return;

    setShopName(data.name ?? '');
    setDescription(data.description ?? '');
    setLogoAssetId(data.shopAvatarUrl ?? null);
    setLogoPreviewBlob(null);
  }, [data]);

  const handlePickLogo = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogoError('Chỉ chấp nhận JPG, JPEG hoặc PNG.');
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setLogoError('Dung lượng file tối đa 2.0MB.');
      return;
    }

    setLogoError(null);
    setUploadingLogo(true);

    const localUrl = URL.createObjectURL(file);
    setLogoPreviewBlob(localUrl);

    try {
      const { assetId, uploadUrl } = await requestUploadAsync({
        contentType: file.type,
        mediaType: 'IMAGE',
      });

      await putFileToUploadUrl(uploadUrl, file);

      const confirmed = await confirmUploadAsync({ id: assetId });

      setLogoAssetId(confirmed.id);
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setLogoPreviewBlob(null);
      setLogoError(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
          'Tải logo lên thất bại. Vui lòng thử lại.',
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const nameChanged = shopName !== (data?.name ?? '');
  const descriptionChanged = description !== (data?.description ?? '');
  const logoChanged = logoAssetId !== (data?.shopAvatarUrl ?? null);

  const isDirty = nameChanged || descriptionChanged || logoChanged;

  const handleSave = () => {
    if (!isDirty) return;

    updateShopBasicInformation({
      name: nameChanged ? shopName : null,
      description: descriptionChanged ? description : null,
      shopAvatarUrl: logoChanged ? logoAssetId : null,
    });
  };

  const handleCancel = () => {
    setShopName(data?.name ?? '');
    setDescription(data?.description ?? '');
    setLogoAssetId(data?.shopAvatarUrl ?? null);
    setLogoPreviewBlob(null);
    setLogoError(null);
  };

  const isNameEmpty = shopName.trim().length === 0;
  const canSubmit = isDirty && !isSaving && !uploadingLogo && !isNameEmpty;

  if (isShopPending) {
    return <ShopProfileSkeleton />;
  }

  return (
    <div className='space-y-3'>
      <div className='bg-white p-6 shadow-sm'>
        <h2 className='mb-5 text-base font-medium text-slate-800'>Thông Tin Cơ Bản</h2>

        <div className='mb-6 flex items-start gap-6'>
          <label className='w-40 shrink-0 pt-2 text-sm text-slate-500'>
            Tên Shop <span className='text-red-500'>*</span>
          </label>
          <div className='flex-1'>
            <input
              type='text'
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className='w-full max-w-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none'
            />
            {isNameEmpty && (
              <p className='mt-1.5 text-xs text-red-500'>Tên Shop không được để trống.</p>
            )}
          </div>
        </div>

        <div className='mb-6 flex items-start gap-6'>
          <label className='w-40 shrink-0 pt-2 text-sm text-slate-500'>Logo Của Shop</label>
          <div className='flex flex-1 items-center gap-5'>
            <div className='group relative'>
              <div className='h-20 w-20 overflow-hidden rounded-full border border-slate-100 bg-slate-50'>
                <LogoPreview previewBlobUrl={logoPreviewBlob} assetId={logoAssetId} />
              </div>
              <button
                type='button'
                onClick={handlePickLogo}
                disabled={uploadingLogo}
                className='absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed'
              >
                {uploadingLogo ? 'Đang tải...' : 'Sửa'}
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/png,image/gif'
                className='hidden'
                disabled={uploadingLogo}
                onChange={handleLogoChange}
              />
            </div>
            <div>
              <ul className='list-disc space-y-1 pl-4 text-xs text-slate-400'>
                <li>Kích thước hình ảnh khuyến khích: Chiều rộng 300px, Chiều cao 300px.</li>
                <li>Dung lượng file tối đa 2.0MB.</li>
                <li>Định dạng file được hỗ trợ: JPG, JPEG, PNG.</li>
              </ul>
              {logoError && <p className='mt-1.5 text-xs text-red-500'>{logoError}</p>}
            </div>
          </div>
        </div>

        <div className='mb-2 flex items-start gap-6'>
          <label className='w-40 shrink-0 pt-2 text-sm text-slate-500'>Mô Tả Shop</label>
          <div className='flex-1'>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Nhập mô tả muốn thông tin về Shop của bạn tại đây'
              rows={4}
              className='w-full max-w-md resize-none border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none'
            />
          </div>
        </div>

        {saveError && <p className='mb-3 ml-40 text-sm text-red-500'>{saveError}</p>}

        <div className='mt-3 ml-40 flex gap-3'>
          <button
            type='button'
            onClick={handleSave}
            disabled={!canSubmit}
            className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-50'
          >
            Lưu
          </button>
          <button
            type='button'
            onClick={handleCancel}
            disabled={!isDirty || isSaving}
            className='cursor-pointer border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopProfileSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='bg-white p-6 shadow-sm'>
        <div className='mb-5 h-5 w-40 animate-pulse rounded bg-slate-200' />

        <div className='mb-6 flex items-start gap-6'>
          <span className='w-40 shrink-0' />
          <div className='h-10 w-full max-w-md animate-pulse rounded bg-slate-200' />
        </div>

        <div className='mb-6 flex items-start gap-6'>
          <span className='w-40 shrink-0' />
          <div className='h-20 w-20 animate-pulse rounded-full bg-slate-200' />
        </div>

        <div className='mb-2 flex items-start gap-6'>
          <span className='w-40 shrink-0' />
          <div className='h-24 w-full max-w-md animate-pulse rounded bg-slate-200' />
        </div>

        <div className='mt-3 ml-40 flex gap-3'>
          <div className='h-10 w-24 animate-pulse rounded bg-slate-200' />
          <div className='h-10 w-24 animate-pulse rounded bg-slate-200' />
        </div>
      </div>
    </div>
  );
}
