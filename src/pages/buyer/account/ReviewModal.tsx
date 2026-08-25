import { useRef, useState, type ChangeEvent } from 'react';
import type { ReviewFormData, ReviewMediaDraft } from '@/types';
import { useRequestUpload, useConfirmUpload, useCreateReview } from '@/hooks';
import StarRating from './StarRating';

type PostedReview = {
  id: string;
  orderItemId: string;
  productId: string;
  shopId: string;
  buyerId: string;
  buyerDisplayName: string;
  rating: number;
  variation: string | null;
  attributes: { label: string; value: string }[];
  comment: string;
  mediaAssetIds: string[];
  likeCount: number;
  createdAt: string;
  sellerReply: { content: string; repliedAt: string } | null;
  isLikedByCurrentUser: boolean;
};

interface ReviewModalProps {
  orderItemId: string;
  productName: string;
  variation: string | null;
  thumbnailUrl: string | null;
  onClose: () => void;
  onSuccess: (orderItemId: string, response: PostedReview) => void;
}

const MAX_IMAGES = 3;
const MAX_VIDEOS = 1;
const MAX_COMMENT_LENGTH = 2000;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 30 * 1024 * 1024;

const PUT_MAX_RETRIES = 2;

const ATTRIBUTE_GROUPS: { label: string; options: string[]; defaultValue: string }[] = [
  {
    label: 'Chất lượng sản phẩm',
    options: ['Rất tốt', 'Tốt', 'Bình thường', 'Không tốt', 'Rất tệ'],
    defaultValue: 'Tốt',
  },
  {
    label: 'Đúng mô tả',
    options: ['Rất giống mô tả', 'Đúng mô tả', 'Tạm chấp nhận', 'Không giống mô tả'],
    defaultValue: 'Đúng mô tả',
  },
  {
    label: 'Đóng gói',
    options: ['Rất chắc chắn', 'Chắc chắn', 'Bình thường', 'Sơ sài'],
    defaultValue: 'Chắc chắn',
  },
];

function buildInitialFormData(orderItemId: string): ReviewFormData {
  return {
    orderItemId,
    rating: 5,
    comment: '',
    attributes: ATTRIBUTE_GROUPS.map((g) => ({ label: g.label, value: g.defaultValue })),
    media: [],
  };
}

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
      headers: { 'Content-Type': file.type },
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

export default function ReviewModal({
  orderItemId,
  productName,
  variation,
  thumbnailUrl,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [formData, setFormData] = useState<ReviewFormData>(() => buildInitialFormData(orderItemId));
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { requestUploadAsync } = useRequestUpload();
  const { confirmUploadAsync } = useConfirmUpload();
  const { createReview, isPending, errorMessage } = useCreateReview();

  const updateForm = (patch: Partial<ReviewFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const imageCount = formData.media.filter((m) => m.type === 'image').length;
  const videoCount = formData.media.filter((m) => m.type === 'video').length;

  const extractErrorMessage = (err: unknown) =>
    (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
    'Tải lên thất bại. Vui lòng thử lại.';

  const addMedia = (item: ReviewMediaDraft) => {
    setFormData((prev) => ({ ...prev, media: [...prev.media, item] }));
  };

  const handleAddImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (imageCount >= MAX_IMAGES) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setMediaError('Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMediaError('Dung lượng ảnh tối đa 5MB.');
      return;
    }

    setMediaError(null);
    setUploadingImage(true);
    const localUrl = URL.createObjectURL(file);

    try {
      const { assetId, uploadUrl } = await requestUploadAsync({
        contentType: file.type,
        mediaType: 'IMAGE',
      });
      await putFileToUploadUrl(uploadUrl, file);
      const confirmed = await confirmUploadAsync({ id: assetId });
      addMedia({ assetId: confirmed.id, previewUrl: localUrl, type: 'image' });
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setMediaError(extractErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddVideo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (videoCount >= MAX_VIDEOS) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setMediaError('Chỉ chấp nhận định dạng video MP4.');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setMediaError('Dung lượng video tối đa 30MB.');
      return;
    }

    setMediaError(null);
    setUploadingVideo(true);
    const localUrl = URL.createObjectURL(file);

    try {
      const { assetId, uploadUrl } = await requestUploadAsync({
        contentType: file.type,
        mediaType: 'VIDEO',
      });
      await putFileToUploadUrl(uploadUrl, file);

      let confirmed;
      try {
        const meta = await readVideoMetadata(file);
        confirmed = await confirmUploadAsync({
          id: assetId,
          width: Math.ceil(meta.width),
          height: Math.ceil(meta.height),
          durationSeconds: Math.ceil(meta.durationSeconds),
        });
      } catch {
        confirmed = await confirmUploadAsync({ id: assetId });
      }

      addMedia({ assetId: confirmed.id, previewUrl: localUrl, type: 'video' });
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setMediaError(extractErrorMessage(err));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleRemoveMedia = (assetId: string) => {
    setFormData((prev) => {
      const target = prev.media.find((m) => m.assetId === assetId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return { ...prev, media: prev.media.filter((m) => m.assetId !== assetId) };
    });
  };

  const handleAttributeChange = (label: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a) => (a.label === label ? { ...a, value } : a)),
    }));
  };

  const handleSubmit = () => {
    const video = formData.media.find((m) => m.type === 'video');
    const images = formData.media.filter((m) => m.type === 'image');

    const mediaAttachments: { mediaAssetId: string; role: string; position: number }[] = [];
    let position = 1;
    if (video) {
      mediaAttachments.push({ mediaAssetId: video.assetId, role: 'review_video', position: 1 });
      position = 2;
    }
    images.forEach((img) => {
      mediaAttachments.push({
        mediaAssetId: img.assetId,
        role: 'review_image',
        position: position++,
      });
    });

    createReview(
      {
        orderItemId: formData.orderItemId,
        rating: formData.rating,
        comment: formData.comment.slice(0, MAX_COMMENT_LENGTH),
        attributes: formData.attributes,
        mediaAttachments,
      },
      {
        onSuccess: (response) => {
          formData.media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
          onSuccess(orderItemId, response as PostedReview);
        },
      },
    );
  };

  const canSubmit = formData.rating > 0 && !isPending && !uploadingImage && !uploadingVideo;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='flex max-h-[90vh] w-full max-w-lg flex-col bg-white'>
        <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
          <h2 className='text-base font-medium text-slate-800'>Đánh Giá Sản Phẩm</h2>
          <button
            type='button'
            onClick={onClose}
            className='cursor-pointer text-slate-400 hover:text-slate-600'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M18 6 6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-5 py-5'>
          <div className='mb-5 flex items-center gap-3'>
            <div className='h-14 w-14 shrink-0 overflow-hidden border border-slate-100 bg-slate-100'>
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt='' className='h-full w-full object-cover' />
              ) : (
                <div className='h-full w-full animate-pulse bg-slate-200' />
              )}
            </div>
            <div>
              <p className='text-sm text-slate-800'>{productName}</p>
              {variation && <p className='text-xs text-slate-400'>{variation}</p>}
            </div>
          </div>

          <div className='mb-5 flex flex-col items-center gap-2 border-b border-slate-100 pb-5'>
            <StarRating
              value={formData.rating}
              onChange={(v) => updateForm({ rating: v })}
              size={32}
            />
            <span className='text-sm text-[#EE4D2D]'>
              {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'][formData.rating]}
            </span>
          </div>

          <div className='mb-5 space-y-3 border-b border-slate-100 pb-5'>
            {ATTRIBUTE_GROUPS.map((group) => {
              const currentValue =
                formData.attributes.find((a) => a.label === group.label)?.value ??
                group.defaultValue;
              return (
                <div key={group.label} className='flex items-center gap-4'>
                  <span className='w-36 shrink-0 text-sm text-slate-600'>{group.label}</span>
                  <select
                    value={currentValue}
                    onChange={(e) => handleAttributeChange(group.label, e.target.value)}
                    className='flex-1 cursor-pointer border border-slate-300 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-[#EE4D2D]'
                  >
                    {group.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <div className='mb-5 border-b border-slate-100 pb-5'>
            <textarea
              value={formData.comment}
              onChange={(e) => updateForm({ comment: e.target.value.slice(0, MAX_COMMENT_LENGTH) })}
              rows={4}
              placeholder='Hãy chia sẻ nhận xét cho sản phẩm này bạn nhé'
              className='w-full resize-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D]'
            />
            <p className='mt-1 text-right text-xs text-slate-400'>
              {formData.comment.length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>

          <div>
            <div className='flex flex-wrap gap-2'>
              {formData.media.map((m) => (
                <div key={m.assetId} className='relative h-20 w-20 border border-slate-200'>
                  {m.type === 'image' ? (
                    <img src={m.previewUrl} alt='' className='h-full w-full object-cover' />
                  ) : (
                    <video src={m.previewUrl} className='h-full w-full object-cover' muted />
                  )}
                  <button
                    type='button'
                    onClick={() => handleRemoveMedia(m.assetId)}
                    className='absolute top-0.5 right-0.5 flex h-4 w-4 cursor-pointer items-center justify-center bg-black/50 text-xs text-white'
                  >
                    ×
                  </button>
                </div>
              ))}

              {imageCount < MAX_IMAGES && (
                <button
                  type='button'
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className='flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-slate-300 text-slate-400 hover:border-[#EE4D2D] hover:text-[#EE4D2D] disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {uploadingImage ? (
                    <div className='h-full w-full animate-pulse bg-slate-200' />
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
                        Ảnh ({imageCount}/{MAX_IMAGES})
                      </span>
                    </>
                  )}
                </button>
              )}

              {videoCount < MAX_VIDEOS && (
                <button
                  type='button'
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className='flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-slate-300 text-[#EE4D2D] hover:bg-[#FFF4F1] disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {uploadingVideo ? (
                    <div className='h-full w-full animate-pulse bg-slate-200' />
                  ) : (
                    <>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
                        <path d='M8 5v14l11-7z' />
                      </svg>
                      <span className='text-[10px]'>Video</span>
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
              <input
                ref={videoInputRef}
                type='file'
                accept={ALLOWED_VIDEO_TYPES.join(',')}
                onChange={handleAddVideo}
                className='hidden'
              />
            </div>
            {mediaError && <p className='mt-1.5 text-xs text-red-500'>{mediaError}</p>}
            <p className='mt-1.5 text-xs text-slate-400'>
              Đăng tối đa 3 hình ảnh và 1 video. Ảnh tối đa 5MB (JPEG, PNG, GIF, WebP). Video tối đa
              30MB (MP4).
            </p>
          </div>

          {errorMessage && <p className='mt-3 text-sm text-red-500'>{errorMessage}</p>}
        </div>

        <div className='flex justify-end gap-3 border-t border-slate-100 px-5 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='cursor-pointer border border-slate-300 px-6 py-2 text-sm text-slate-600 hover:bg-slate-50'
          >
            Trở Lại
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!canSubmit}
            className='cursor-pointer bg-[#EE4D2D] px-8 py-2 text-sm font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending ? 'Đang gửi...' : 'Hoàn Thành'}
          </button>
        </div>
      </div>
    </div>
  );
}
