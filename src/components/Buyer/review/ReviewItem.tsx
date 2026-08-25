import { useState } from 'react';
import { X } from 'lucide-react';
import { useGetReviewByProduct } from '@/hooks';
import { BiLike } from 'react-icons/bi';

type ReviewItemData = ReturnType<typeof useGetReviewByProduct>['reviews'][number];
type AssetDetail = { publicUrl: string; mediaType: string; durationSeconds: number };

type ReviewItemProps = {
  review: ReviewItemData;
  assetDetailsMap: Record<string, AssetDetail>;
  isLoadingAssets: boolean;
  avatarUrl?: string;
  isLoadingAvatar: boolean;
  onToggleLike: (review: ReviewItemData) => void;
};
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export default function ReviewItem({
  review,
  assetDetailsMap,
  isLoadingAssets,
  avatarUrl,
  isLoadingAvatar,
  onToggleLike,
}: ReviewItemProps) {
  const [viewingAsset, setViewingAsset] = useState<AssetDetail | null>(null);

  return (
    <div className='border-b border-slate-100 py-6'>
      <div className='flex gap-3'>
        <div className='flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-medium text-slate-500'>
          {isLoadingAvatar && !avatarUrl ? (
            <div className='h-full w-full animate-pulse rounded-full bg-slate-200' />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt={review.buyerDisplayName}
              className='h-full w-full object-cover'
            />
          ) : (
            getInitials(review.buyerDisplayName)
          )}
        </div>
        <div className='flex-1'>
          <p className='text-sm text-slate-700'>{review.buyerDisplayName}</p>

          <div className='mt-1 flex items-center gap-0.5 text-[#EE4D2D]'>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill={i < review.rating ? 'currentColor' : 'none'}
                stroke='currentColor'
                strokeWidth='1.5'
              >
                <path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z' />
              </svg>
            ))}
          </div>

          <p className='mt-1.5 text-xs text-slate-400'>
            {formatDate(review.createdAt)}
            {review.variation && ` | Phân loại hàng: ${review.variation}`}
          </p>

          {review.attributes.length > 0 && (
            <div className='mt-2 flex flex-wrap items-center gap-x-2 text-sm text-slate-400'>
              {review.attributes.map((attr, index) => (
                <span key={attr.label}>
                  {index > 0 && <span className='mr-2'>|</span>}
                  {attr.label}: <span>{attr.value}</span>
                </span>
              ))}
            </div>
          )}

          {review.comment && <p className='mt-2 text-sm text-slate-800'>{review.comment}</p>}

          {review.mediaAssetIds.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {review.mediaAssetIds.map((assetId) => {
                const asset = assetDetailsMap[assetId];

                if (isLoadingAssets || !asset) {
                  return (
                    <div
                      key={assetId}
                      className='h-20 w-20 animate-pulse rounded-sm bg-slate-100'
                    />
                  );
                }

                const isVideo = asset.mediaType === 'VIDEO';

                if (isVideo) {
                  return (
                    <button
                      key={assetId}
                      type='button'
                      onClick={() => setViewingAsset(asset)}
                      className='relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-sm bg-black'
                    >
                      <video
                        src={asset.publicUrl}
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
                      <span className='pointer-events-none absolute right-1 bottom-1 flex items-center gap-1 rounded-sm bg-black/60 px-1 py-0.5 text-[10px] text-white'>
                        {formatDuration(asset.durationSeconds)}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={assetId}
                    type='button'
                    onClick={() => setViewingAsset(asset)}
                    className='h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-sm'
                  >
                    <img src={asset.publicUrl} alt='' className='h-full w-full object-cover' />
                  </button>
                );
              })}
            </div>
          )}

          {review.sellerReply && (
            <div className='mt-3 rounded-sm bg-slate-50 p-3'>
              <p className='text-xs font-medium text-slate-600'>Phản hồi của Người bán</p>
              <p className='mt-1 text-sm text-slate-700'>{review.sellerReply.content}</p>
              <p className='mt-1 text-xs text-slate-400'>
                {formatDate(review.sellerReply.repliedAt)}
              </p>
            </div>
          )}

          <div className='mt-3 flex items-center justify-between'>
            <button
              type='button'
              onClick={() => onToggleLike(review)}
              className={`flex cursor-pointer items-center gap-1.5 text-xs hover:text-[#EE4D2D] ${
                review.isLikedByCurrentUser ? 'text-[#EE4D2D]' : 'text-slate-400'
              }`}
            >
              <BiLike className='h-4 w-4' />
              {review.likeCount}
            </button>
            <button className='text-slate-400 hover:text-slate-600' aria-label='Tuỳ chọn khác'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
                <circle cx='12' cy='5' r='1.6' />
                <circle cx='12' cy='12' r='1.6' />
                <circle cx='12' cy='19' r='1.6' />
              </svg>
            </button>
          </div>
        </div>
      </div>

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
            {viewingAsset.mediaType === 'VIDEO' ? (
              <video
                src={viewingAsset.publicUrl}
                className='max-h-[85vh] max-w-3xl'
                controls
                autoPlay
              />
            ) : (
              <img
                src={viewingAsset.publicUrl}
                alt='review'
                className='max-h-[85vh] max-w-3xl object-contain'
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
