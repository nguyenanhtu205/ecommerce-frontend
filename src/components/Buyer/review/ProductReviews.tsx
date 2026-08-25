import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import {
  useGetReviewByProduct,
  useGetReviewAggregate,
  useGetMultipleAssets,
  useGetAssetsByOwnerRole,
  useLikeReview,
  useUnlikeReview,
} from '@/hooks';
import ReviewFilterBar from './ReviewFilterBar';
import ReviewItem from './ReviewItem';

type ReviewItemData = ReturnType<typeof useGetReviewByProduct>['reviews'][number];
type ReviewFilterKey = 'all' | 'comment' | 'media' | 1 | 2 | 3 | 4 | 5;

const PAGE_SIZE = 10;

type ProductReviewsProps = {
  productId: string;
  onReady?: () => void;
};

export default function ProductReviews({ productId, onReady }: ProductReviewsProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<ReviewFilterKey>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const params = useMemo(() => {
    const base = { page: currentPage, pageSize: PAGE_SIZE };
    if (typeof activeFilter === 'number') return { ...base, rating: activeFilter };
    if (activeFilter === 'comment') return { ...base, hasComment: true };
    if (activeFilter === 'media') return { ...base, hasMedia: true };
    return base;
  }, [activeFilter, currentPage]);

  const { reviews, isLoading, errorMessage } = useGetReviewByProduct(productId, params);
  const { data: aggregate, isLoading: isAggregateLoading } = useGetReviewAggregate(productId);
  const { likeReview } = useLikeReview();
  const { unlikeReview } = useUnlikeReview();

  const mediaAssetIds = useMemo(
    () => Array.from(new Set(reviews.flatMap((r) => r.mediaAssetIds))),
    [reviews],
  );
  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets(
    { assetIds: mediaAssetIds },
    { enabled: mediaAssetIds.length > 0 },
  );
  const assetDetailsMap = useMemo(() => {
    const map: Record<string, { publicUrl: string; mediaType: string; durationSeconds: number }> =
      {};
    assetsData?.items.forEach((item) => {
      if (item.found) {
        map[item.id] = {
          publicUrl: item.asset.publicUrl,
          mediaType: item.asset.mediaType,
          durationSeconds: item.asset.durationSeconds,
        };
      }
    });
    return map;
  }, [assetsData]);
  const isLoadingAssets = mediaAssetIds.length > 0 && isAssetsPending;

  const buyerIds = useMemo(() => Array.from(new Set(reviews.map((r) => r.buyerId))), [reviews]);
  const { data: avatarsData, isPending: isAvatarsPending } = useGetAssetsByOwnerRole(
    {
      ownerService: 'user-service',
      ownerType: 'user_avatar',
      items: buyerIds.map((id) => ({ ownerId: id, role: 'avatar' })),
    },
    { enabled: buyerIds.length > 0 },
  );
  const avatarUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    avatarsData?.items.forEach((item) => {
      if (item.found) {
        map[item.ownerId] = item.asset.publicUrl;
      }
    });
    return map;
  }, [avatarsData]);
  const isLoadingAvatars = buyerIds.length > 0 && isAvatarsPending;

  const hasNotifiedReady = useRef(false);
  useEffect(() => {
    if (hasNotifiedReady.current) return;
    if (!isLoading && !isAggregateLoading && !isLoadingAssets) {
      hasNotifiedReady.current = true;
      onReady?.();
    }
  }, [isLoading, isAggregateLoading, isLoadingAssets, onReady]);

  const handleFilterChange = (filter: ReviewFilterKey) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleToggleLike = (review: ReviewItemData) => {
    if (!user) {
      navigate('/buyer/login');
      return;
    }
    const nextLiked = !review.isLikedByCurrentUser;

    queryClient.setQueryData<ReviewItemData[]>(['review', productId, params], (old) =>
      old?.map((r) =>
        r.id === review.id
          ? { ...r, isLikedByCurrentUser: nextLiked, likeCount: r.likeCount + (nextLiked ? 1 : -1) }
          : r,
      ),
    );

    if (nextLiked) {
      likeReview(review.id);
    } else {
      unlikeReview(review.id);
    }
  };

  const hasNextPage = reviews.length === PAGE_SIZE;

  return (
    <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-base font-medium tracking-wide text-slate-800'>ĐÁNH GIÁ SẢN PHẨM</h2>

      {isAggregateLoading || !aggregate ? (
        <div className='h-28 w-full animate-pulse rounded-sm bg-slate-100' />
      ) : (
        <ReviewFilterBar
          aggregate={aggregate}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      <div>
        {isLoading ? (
          <div className='space-y-4 py-6'>
            <div className='h-20 w-full animate-pulse rounded bg-slate-100' />
            <div className='h-20 w-full animate-pulse rounded bg-slate-100' />
          </div>
        ) : errorMessage ? (
          <p className='py-10 text-center text-sm text-red-500'>{errorMessage}</p>
        ) : reviews.length === 0 ? (
          <p className='py-10 text-center text-sm text-slate-400'>Không có đánh giá phù hợp.</p>
        ) : (
          reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              assetDetailsMap={assetDetailsMap}
              isLoadingAssets={isLoadingAssets}
              avatarUrl={avatarUrlMap[review.buyerId]}
              isLoadingAvatar={isLoadingAvatars}
              onToggleLike={handleToggleLike}
            />
          ))
        )}
      </div>

      {!isLoading && reviews.length > 0 && (
        <div className='mt-4 flex items-center justify-center gap-3'>
          <button
            type='button'
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className='flex h-8 items-center gap-1 px-2 text-sm text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
            >
              <path d='m15 18-6-6 6-6' />
            </svg>
            Trước
          </button>
          <span className='flex h-8 w-8 items-center justify-center rounded-sm bg-[#EE4D2D] text-sm text-white'>
            {currentPage}
          </span>
          <button
            type='button'
            disabled={!hasNextPage}
            onClick={() => setCurrentPage((p) => p + 1)}
            className='flex h-8 items-center gap-1 px-2 text-sm text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40'
          >
            Sau
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
            >
              <path d='m9 18 6-6-6-6' />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
