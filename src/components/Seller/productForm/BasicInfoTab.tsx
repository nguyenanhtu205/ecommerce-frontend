import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import type { ProductFormData, ProductAttributeValue } from '@/types';
import { useRequestUpload, useConfirmUpload, useGetCategoryAttributes } from '@/hooks';
import CategoryModal from './CategoryModal';
import FormRow from './FormRow';

interface BasicInfoTabProps {
  formData: ProductFormData;
  onChange: (patch: Partial<ProductFormData>) => void;
}

const MAX_IMAGES = 4;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];

const PUT_MAX_RETRIES = 2;

function readVideoMetadata(
  file: File,
): Promise<{ width: number; height: number; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        durationSeconds: video.duration,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không đọc được thông tin video'));
    };
    video.src = url;
  });
}

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

export default function BasicInfoTab({ formData, onChange }: BasicInfoTabProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<{ url: string; kind: 'image' | 'video' } | null>(
    null,
  );

  const [imageError, setImageError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const value = tagInput.trim();
    if (!value) return;

    const isDuplicate = formData.tags.some((t) => t.toLowerCase() === value.toLowerCase());
    if (!isDuplicate) {
      onChange({ tags: [...formData.tags, value] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    onChange({ tags: formData.tags.filter((t) => t !== tag) });
  };

  const { data: categoryAttributes = [] } = useGetCategoryAttributes(formData.categoryId ?? '');

  const { requestUploadAsync } = useRequestUpload();
  const { confirmUploadAsync } = useConfirmUpload();

  const extractErrorMessage = (err: unknown) =>
    (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
    'Tải lên thất bại. Vui lòng thử lại.';

  const uploadImageFile = async (file: File, localUrl: string) => {
    const { assetId, uploadUrl } = await requestUploadAsync({
      contentType: file.type,
      mediaType: 'IMAGE',
    });

    await putFileToUploadUrl(uploadUrl, file);

    const confirmed = await confirmUploadAsync({ id: assetId });

    return { assetId: confirmed.id, url: localUrl };
  };

  const uploadVideoFile = async (file: File, localUrl: string) => {
    const { assetId, uploadUrl } = await requestUploadAsync({
      contentType: file.type,
      mediaType: 'VIDEO',
    });

    await putFileToUploadUrl(uploadUrl, file);

    const { width, height, durationSeconds } = await readVideoMetadata(file);

    const confirmed = await confirmUploadAsync({
      id: assetId,
      width: Math.ceil(width),
      height: Math.ceil(height),
      durationSeconds: Math.ceil(durationSeconds),
    });

    return { assetId: confirmed.id, url: localUrl };
  };

  const handleAddImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (formData.images.length >= MAX_IMAGES) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP.');
      return;
    }

    setImageError(null);
    setUploadingImage(true);

    const localUrl = URL.createObjectURL(file);

    try {
      const asset = await uploadImageFile(file, localUrl);
      onChange({ images: [...formData.images, asset] });
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setImageError(extractErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddThumbnail = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setThumbnailError('Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP.');
      return;
    }

    setThumbnailError(null);
    setUploadingThumbnail(true);

    const localUrl = URL.createObjectURL(file);
    if (formData.thumbnail) URL.revokeObjectURL(formData.thumbnail.url);

    try {
      const asset = await uploadImageFile(file, localUrl);
      onChange({ thumbnail: asset });
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setThumbnailError(extractErrorMessage(err));
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleAddVideo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setVideoError('Chỉ chấp nhận định dạng MP4.');
      return;
    }

    setVideoError(null);
    setUploadingVideo(true);

    const localUrl = URL.createObjectURL(file);
    if (formData.video) URL.revokeObjectURL(formData.video.url);

    try {
      const asset = await uploadVideoFile(file, localUrl);
      onChange({ video: asset });
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setVideoError(extractErrorMessage(err));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleAttributeChange = (attrId: string, name: string, value: string) => {
    const exists = formData.attributes.find((a) => a.attributeId === attrId);
    const next: ProductAttributeValue[] = exists
      ? formData.attributes.map((a) => (a.attributeId === attrId ? { ...a, value } : a))
      : [...formData.attributes, { attributeId: attrId, name, value }];
    onChange({ attributes: next });
  };

  const filledAttrCount = formData.attributes.filter((a) => a.value.trim().length > 0).length;

  return (
    <div className='bg-white p-6 shadow-sm'>
      <h2 className='mb-5 text-base font-medium text-slate-800'>Thông tin cơ bản</h2>

      <div className='space-y-6'>
        <FormRow label='Hình ảnh sản phẩm' required>
          <div className='flex flex-wrap gap-2'>
            {formData.images.map((img, idx) => (
              <div key={img.assetId} className='relative h-20 w-20 border border-slate-200'>
                <button
                  type='button'
                  onClick={() => setViewingAsset({ url: img.url, kind: 'image' })}
                  className='h-full w-full cursor-pointer'
                >
                  <img src={img.url} alt='' className='h-full w-full object-cover' />
                </button>
                <button
                  type='button'
                  onClick={() => {
                    const removed = formData.images[idx];
                    URL.revokeObjectURL(removed.url);
                    onChange({ images: formData.images.filter((_, i) => i !== idx) });
                  }}
                  className='absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center bg-black/50 text-white'
                >
                  ×
                </button>
              </div>
            ))}
            {formData.images.length < MAX_IMAGES && (
              <button
                type='button'
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className='flex h-20 w-20 flex-col items-center justify-center gap-1 border border-dashed border-slate-300 text-slate-400 hover:border-[#EE4D2D] hover:text-[#EE4D2D] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {uploadingImage ? (
                  <span className='text-[10px]'>Đang tải...</span>
                ) : (
                  <>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <rect x='3' y='3' width='18' height='18' rx='1' />
                      <path d='M9 9h.01M21 15l-5-5-6 6M9 21H5a2 2 0 0 1-2-2v-4' />
                    </svg>
                    <span className='text-[10px]'>
                      Thêm hình ảnh ({formData.images.length}/{MAX_IMAGES})
                    </span>
                  </>
                )}
              </button>
            )}
            <input
              ref={imageInputRef}
              type='file'
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleAddImage}
              className='hidden'
            />
          </div>
          {imageError && <p className='mt-1.5 text-xs text-red-500'>{imageError}</p>}
        </FormRow>

        <FormRow label='Ảnh bìa' required>
          {formData.thumbnail ? (
            <div className='relative h-20 w-20 border border-slate-200'>
              <button
                type='button'
                onClick={() => setViewingAsset({ url: formData.thumbnail!.url, kind: 'image' })}
                className='h-full w-full cursor-pointer'
              >
                <img src={formData.thumbnail.url} alt='' className='h-full w-full object-cover' />
              </button>
              <button
                type='button'
                onClick={() => {
                  if (formData.thumbnail) URL.revokeObjectURL(formData.thumbnail.url);
                  onChange({ thumbnail: null });
                }}
                className='absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center bg-black/50 text-white'
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type='button'
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={uploadingThumbnail}
              className='flex h-20 w-20 flex-col items-center justify-center gap-1 border border-dashed border-slate-300 text-slate-400 hover:border-[#EE4D2D] hover:text-[#EE4D2D] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {uploadingThumbnail ? (
                <span className='text-[10px]'>Đang tải...</span>
              ) : (
                <>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <rect x='3' y='3' width='18' height='18' rx='1' />
                  </svg>
                  <span className='text-[10px]'>Tải lên (0/1)</span>
                </>
              )}
            </button>
          )}
          <input
            ref={thumbnailInputRef}
            type='file'
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleAddThumbnail}
            className='hidden'
          />
          {thumbnailError && <p className='mt-1.5 text-xs text-red-500'>{thumbnailError}</p>}
          <p className='mt-1.5 max-w-md text-xs text-slate-400'>
            Ảnh bìa sẽ được hiển thị tại các trang Kết quả tìm kiếm, Gợi ý hôm nay,... Việc sử dụng
            ảnh bìa đẹp sẽ thu hút thêm lượt truy cập.
          </p>
        </FormRow>

        <FormRow label='Video sản phẩm'>
          {formData.video ? (
            <div className='relative h-20 w-20 overflow-hidden border border-slate-200 bg-black'>
              <button
                type='button'
                onClick={() => setViewingAsset({ url: formData.video!.url, kind: 'video' })}
                className='h-full w-full cursor-pointer'
              >
                <video
                  src={formData.video.url}
                  className='h-full w-full object-cover'
                  muted
                  playsInline
                  preload='metadata'
                />
                <span className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[10px] text-white'>
                    ▶
                  </span>
                </span>
              </button>
              <button
                type='button'
                onClick={() => {
                  if (formData.video) URL.revokeObjectURL(formData.video.url);
                  onChange({ video: null });
                }}
                className='absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center bg-black/50 text-white'
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type='button'
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingVideo}
              className='flex h-20 w-20 flex-col items-center justify-center gap-1 border border-dashed border-slate-300 text-[#EE4D2D] hover:bg-[#FFF4F1] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {uploadingVideo ? (
                <span className='text-[10px]'>Đang tải...</span>
              ) : (
                <>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M8 5v14l11-7z' />
                  </svg>
                  <span className='text-[10px]'>Thêm video</span>
                </>
              )}
            </button>
          )}
          <input
            ref={videoInputRef}
            type='file'
            accept={ALLOWED_VIDEO_TYPES.join(',')}
            onChange={handleAddVideo}
            className='hidden'
          />
          {videoError && <p className='mt-1.5 text-xs text-red-500'>{videoError}</p>}
          <p className='mt-1.5 max-w-md text-xs text-slate-400'>
            Kích thước tối đa 30Mb, độ phân giải không vượt quá 1280x1280px. Độ dài: 10s-60s. Định
            dạng: MP4.
          </p>
        </FormRow>

        <FormRow label='Tên sản phẩm' required>
          <input
            value={formData.name}
            maxLength={200}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder='Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật'
            className='w-full max-w-2xl border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-[#EE4D2D]'
          />
        </FormRow>

        <FormRow label='Ngành hàng' required>
          <button
            type='button'
            onClick={() => setShowCategoryModal(true)}
            className='flex w-full max-w-2xl items-center justify-between border border-slate-300 px-3 py-2 text-left text-sm text-slate-700 hover:border-[#EE4D2D]'
          >
            {formData.categoryLabel || <span className='text-slate-400'>Chọn ngành hàng</span>}
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' />
            </svg>
          </button>
        </FormRow>

        <FormRow label='Mô tả sản phẩm' required>
          <textarea
            value={formData.description}
            maxLength={5000}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={6}
            className='w-full max-w-2xl resize-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D]'
          />
        </FormRow>

        <FormRow label='Nhu cầu / Dịp dùng' required>
          <div className='w-full max-w-2xl'>
            <div className='flex flex-wrap items-center gap-2 border border-slate-300 px-2 py-1.5 focus-within:border-[#EE4D2D]'>
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className='flex items-center gap-1 bg-slate-100 px-2 py-1 text-xs text-slate-700'
                >
                  {tag}
                  <button
                    type='button'
                    onClick={() => handleRemoveTag(tag)}
                    className='text-slate-400 hover:text-slate-600'
                    aria-label={`Xoá tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={
                  formData.tags.length === 0 ? 'Nhập rồi nhấn Enter, VD: quà tặng, sinh nhật' : ''
                }
                className='min-w-30 flex-1 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400'
              />
            </div>
            <p className='mt-1.5 max-w-md text-xs text-slate-400'>
              Thêm từ khoá mô tả nhu cầu hoặc dịp sử dụng sản phẩm (không phải tên hay thông số),
              giúp người mua tìm thấy sản phẩm khi tìm theo nhu cầu — ví dụ "quà tặng", "sinh nhật",
              "dụng cụ gia đình" — dù tên sản phẩm không chứa các từ này.
            </p>
          </div>
        </FormRow>
      </div>

      {formData.categoryId && (
        <div className='mt-8 border-t border-slate-100 pt-6'>
          <h3 className='mb-1 text-sm font-medium text-slate-800'>Thông tin chi tiết</h3>
          <p className='mb-4 text-xs text-slate-400'>
            Hoàn thành: {filledAttrCount}/{categoryAttributes.length} Điền thông tin thuộc tính để
            tăng mức độ hiển thị cho sản phẩm.
          </p>

          <div className='grid grid-cols-2 gap-x-8 gap-y-5'>
            {categoryAttributes
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((attr) => {
                const currentValue =
                  formData.attributes.find((a) => a.attributeId === attr.id)?.value ?? '';
                return (
                  <div key={attr.id} className='flex items-start gap-6'>
                    <span className='w-40 shrink-0 pt-2 text-right text-sm text-slate-500'>
                      {attr.required && <span className='mr-0.5 text-red-500'>*</span>}
                      {attr.name}
                    </span>
                    <div className='flex-1'>
                      {attr.inputType === 'select' ? (
                        <select
                          value={currentValue}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, attr.name, e.target.value)
                          }
                          className='w-full border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#EE4D2D]'
                        >
                          <option value=''>Vui lòng chọn</option>
                          {attr.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={currentValue}
                          onChange={(e) =>
                            handleAttributeChange(attr.id, attr.name, e.target.value)
                          }
                          className='w-full border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D]'
                        />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {viewingAsset && (
        <div
          className='fixed inset-0 z-70 flex items-center justify-center bg-black/70'
          onClick={() => setViewingAsset(null)}
        >
          <button
            onClick={() => setViewingAsset(null)}
            className='absolute top-4 right-4 cursor-pointer text-white hover:text-slate-300'
          >
            <X size={24} />
          </button>
          <div onClick={(e) => e.stopPropagation()} className='max-h-[85vh] max-w-3xl'>
            {viewingAsset.kind === 'video' ? (
              <video src={viewingAsset.url} className='max-h-[85vh] max-w-3xl' controls autoPlay />
            ) : (
              <img
                src={viewingAsset.url}
                alt=''
                className='max-h-[85vh] max-w-3xl object-contain'
              />
            )}
          </div>
        </div>
      )}

      {showCategoryModal && (
        <CategoryModal
          open={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSelect={(categoryId, categoryLabel) => {
            onChange({ categoryId, categoryLabel, attributes: [] });
            setShowCategoryModal(false);
          }}
        />
      )}
    </div>
  );
}
