import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { SellerBreadcrumb } from '@/components';
import {
  useGetShopReviewStats,
  useGetShopReviewCounts,
  useGetShopReviews,
  useGetOrderItemInfo,
  useGetMultipleAssets,
  useGetAssetsByOwnerRole,
  useReplyReview,
} from '@/hooks';

type ReviewStatus = 'all' | 'to_reply' | 'replied';
type StarFilter = 5 | 4 | 3 | 2 | 1;
type ShopReview = ReturnType<typeof useGetShopReviews>['reviews'][number];
type OrderItemInfo = ReturnType<typeof useGetOrderItemInfo>['orderItems'][number];
type AssetInfo = NonNullable<
  ReturnType<typeof useGetMultipleAssets>['data']
>['items'][number]['asset'];

const STAR_OPTIONS: StarFilter[] = [5, 4, 3, 2, 1];
const PAGE_SIZE = 20;
const PLACEHOLDER_THUMB = 'https://placehold.co/56x56';
const PLACEHOLDER_AVATAR = 'https://placehold.co/20x20';

function TrendBadge({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  return (
    <span
      className={`ml-1 ${isNeutral ? 'text-slate-400' : isPositive ? 'text-green-600' : 'text-red-500'}`}
    >
      {isNeutral ? '' : isPositive ? '▲' : '▼'} {Math.abs(value)}%
    </span>
  );
}

function StatBox({ label, value, trend }: { label: string; value: string; trend: number }) {
  return (
    <div>
      <p className='flex items-center gap-1 text-sm text-slate-500'>
        {label}
        <HelpCircle size={14} className='text-slate-400' />
      </p>
      <p className='mt-2 text-2xl font-medium text-slate-800'>{value}</p>
      <p className='mt-1 text-xs text-slate-400'>
        so với 30 ngày trước
        <TrendBadge value={trend} />
      </p>
    </div>
  );
}

type PlaceholderInputProps = {
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  boldPart: string;
  normalPart: string;
  readOnly?: boolean;
  onClick?: () => void;
  className: string;
  wrapperClassName?: string;
};

function PlaceholderInput({
  value,
  onChange,
  boldPart,
  normalPart,
  readOnly,
  onClick,
  className,
  wrapperClassName = 'flex-1',
}: PlaceholderInputProps) {
  const [focused, setFocused] = useState(false);
  const showPlaceholder = !value && !focused;

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        onClick={onClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={className}
      />
      {showPlaceholder && (
        <div className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm'>
          <span className='text-slate-800'>{boldPart}</span>
          <span className='ml-1.5 text-slate-400'>{normalPart}</span>
        </div>
      )}
    </div>
  );
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

type DateRangePopoverProps = {
  fromDate: string;
  toDate: string;
  onApply: (from: string, to: string) => void;
  className: string;
};

function DateRangePopover({ fromDate, toDate, onApply, className }: DateRangePopoverProps) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(fromDate);
  const [draftTo, setDraftTo] = useState(toDate);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setDraftFrom(fromDate);
    setDraftTo(toDate);
    setOpen((o) => !o);
  };

  const handleApply = () => {
    onApply(draftFrom, draftTo);
    setOpen(false);
  };

  const handleClear = () => {
    setDraftFrom('');
    setDraftTo('');
    onApply('', '');
    setOpen(false);
  };

  const displayText =
    fromDate && toDate ? `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}` : '';

  return (
    <div className='relative flex-1' ref={ref}>
      <PlaceholderInput
        value={displayText}
        readOnly
        onClick={handleOpen}
        boldPart='Thời gian đánh giá '
        normalPart='Chọn thời gian'
        className={className}
      />

      {open && (
        <div className='absolute z-10 mt-1 w-72 space-y-3 border border-slate-200 bg-white p-4 shadow-lg'>
          <div>
            <label className='mb-1 block text-xs text-slate-500'>Từ ngày</label>
            <input
              type='date'
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              max={draftTo || undefined}
              className='h-9 w-full cursor-pointer border border-slate-300 px-2 text-sm text-slate-600 outline-none focus:border-[#EE4D2D]'
            />
          </div>
          <div>
            <label className='mb-1 block text-xs text-slate-500'>Đến ngày</label>
            <input
              type='date'
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              min={draftFrom || undefined}
              className='h-9 w-full cursor-pointer border border-slate-300 px-2 text-sm text-slate-600 outline-none focus:border-[#EE4D2D]'
            />
          </div>
          <div className='flex justify-end gap-2 pt-1'>
            <button
              onClick={handleClear}
              className='h-8 cursor-pointer border border-slate-300 px-3 text-xs text-slate-600 hover:bg-slate-50'
            >
              Xóa
            </button>
            <button
              onClick={handleApply}
              className='h-8 cursor-pointer border border-[#EE4D2D] bg-[#EE4D2D] px-3 text-xs text-white hover:bg-[#d8431f]'
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ReplyModalProps = {
  review: ShopReview;
  onClose: () => void;
};

function ReplyModal({ review, onClose }: ReplyModalProps) {
  const [content, setContent] = useState(review.sellerReply?.content ?? '');
  const { replyReview, isPending, errorMessage } = useReplyReview();

  const handleSubmit = () => {
    if (!content.trim()) return;
    replyReview({ reviewId: review.id, content: content.trim() }, { onSuccess: onClose });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='w-full max-w-lg rounded-sm bg-white p-6 shadow-lg'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-base font-medium text-slate-800'>Trả lời đánh giá</h3>
          <button onClick={onClose} className='cursor-pointer text-slate-400 hover:text-slate-600'>
            <X size={18} />
          </button>
        </div>

        <div className='mb-3 border border-slate-100 bg-slate-50 p-3'>
          <p className='mb-1 text-sm text-amber-400'>
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)}
          </p>
          <p className='text-sm text-slate-600'>{review.comment}</p>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder='Nhập nội dung phản hồi...'
          className='w-full resize-none border border-slate-300 p-3 text-sm outline-none focus:border-[#EE4D2D]'
        />

        {errorMessage && <p className='mt-2 text-xs text-red-500'>{errorMessage}</p>}

        <div className='mt-4 flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='h-9 cursor-pointer border border-slate-300 px-4 text-sm text-slate-600 hover:bg-slate-50'
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            className='h-9 cursor-pointer border border-[#EE4D2D] bg-[#EE4D2D] px-4 text-sm text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
          </button>
        </div>
      </div>
    </div>
  );
}

type ReviewRowProps = {
  review: ShopReview;
  orderItem?: OrderItemInfo;
  isOrderItemLoading: boolean;
  thumbnailUrl?: string;
  isThumbnailLoading: boolean;
  mediaAssetMap: Record<string, AssetInfo>;
  isMediaLoading: boolean;
  avatarUrl?: string;
  isAvatarLoading: boolean;
  onReply: (review: ShopReview) => void;
};

function ReviewRow({
  review,
  orderItem,
  isOrderItemLoading,
  thumbnailUrl,
  isThumbnailLoading,
  mediaAssetMap,
  isMediaLoading,
  avatarUrl,
  isAvatarLoading,
  onReply,
}: ReviewRowProps) {
  const [viewingAsset, setViewingAsset] = useState<AssetInfo | null>(null);

  return (
    <div className='grid grid-cols-[2fr_3fr_1fr] gap-4 py-5'>
      <div>
        <div className='mb-2 flex items-start gap-2 text-sm'>
          {isAvatarLoading ? (
            <span className='h-5 w-5 shrink-0 animate-pulse rounded-full bg-slate-200' />
          ) : (
            <img
              src={avatarUrl ?? PLACEHOLDER_AVATAR}
              alt={review.buyerDisplayName}
              className='h-5 w-5 shrink-0 rounded-full object-cover'
            />
          )}

          <div className='min-w-0'>
            <p className='text-slate-600'>{review.buyerDisplayName}</p>

            {isOrderItemLoading ? (
              <span className='mt-1 inline-block h-3 w-32 animate-pulse rounded bg-slate-200' />
            ) : (
              <p className='mt-1 text-xs text-slate-400'>
                Mã đơn hàng: {orderItem?.orderId ?? '—'}
              </p>
            )}
          </div>
        </div>
        <div className='flex gap-3'>
          {isOrderItemLoading || isThumbnailLoading ? (
            <div className='h-14 w-14 shrink-0 animate-pulse rounded bg-slate-200' />
          ) : (
            <img
              src={thumbnailUrl ?? PLACEHOLDER_THUMB}
              alt={orderItem?.productName ?? ''}
              className='h-14 w-14 shrink-0 rounded object-cover'
            />
          )}
          <div>
            {isOrderItemLoading ? (
              <>
                <div className='h-3.5 w-32 animate-pulse rounded bg-slate-200' />
                <div className='mt-1 h-3 w-40 animate-pulse rounded bg-slate-200' />
              </>
            ) : (
              <>
                <p className='text-sm text-slate-700'>{orderItem?.productName ?? '—'}</p>
                {review.variation && (
                  <p className='mt-1 text-xs text-slate-400'>
                    {review.variation} x {orderItem?.quantity}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className='pl-4'>
        <p className='mb-2 text-sm text-amber-400'>
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
        </p>
        <p className='text-sm text-slate-700'>{review.comment}</p>
        {review.sellerReply && (
          <div className='mt-2 border-l-2 border-slate-200 bg-slate-50 p-2'>
            <p className='text-xs font-medium text-slate-500'>Phản hồi của Shop</p>
            <p className='mt-0.5 text-sm text-slate-600'>{review.sellerReply.content}</p>
          </div>
        )}
        {review.mediaAssetIds.length > 0 && (
          <div className='mt-2 flex gap-2'>
            {isMediaLoading
              ? review.mediaAssetIds.map((id) => (
                  <div key={id} className='h-12 w-12 animate-pulse rounded bg-slate-200' />
                ))
              : review.mediaAssetIds.map((id) => {
                  const asset = mediaAssetMap[id];
                  const isVideo =
                    asset?.mediaType === 'video' || asset?.contentType?.startsWith('video/');

                  if (isVideo) {
                    return (
                      <button
                        key={id}
                        type='button'
                        onClick={() => asset && setViewingAsset(asset)}
                        className='relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded bg-black'
                      >
                        <video
                          src={asset?.publicUrl}
                          className='h-full w-full object-cover'
                          muted
                          playsInline
                          preload='metadata'
                        />
                        <span className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] text-white'>
                            ▶
                          </span>
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={id}
                      type='button'
                      onClick={() => asset && setViewingAsset(asset)}
                      className='h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded'
                    >
                      <img
                        src={asset?.publicUrl ?? PLACEHOLDER_THUMB}
                        alt='review'
                        className='h-full w-full object-cover'
                      />
                    </button>
                  );
                })}
          </div>
        )}
      </div>

      <div className='flex justify-end'>
        {!review.sellerReply && (
          <button
            onClick={() => onReply(review)}
            className='h-8 cursor-pointer border border-slate-300 px-4 text-sm text-slate-700 hover:border-[#EE4D2D] hover:text-[#EE4D2D]'
          >
            Trả lời
          </button>
        )}
      </div>

      {viewingAsset && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
          onClick={() => setViewingAsset(null)}
        >
          <button
            onClick={() => setViewingAsset(null)}
            className='absolute top-4 right-4 cursor-pointer text-white hover:text-slate-300'
          >
            <X size={24} />
          </button>

          <div onClick={(e) => e.stopPropagation()} className='max-h-[85vh] max-w-3xl'>
            {viewingAsset.mediaType === 'video' ||
            viewingAsset.contentType?.startsWith('video/') ? (
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

export default function ReviewManagement() {
  const [status, setStatus] = useState<ReviewStatus>('all');
  const [starFilters, setStarFilters] = useState<Set<StarFilter>>(new Set([5, 4, 3, 2, 1]));
  const [appliedStatus, setAppliedStatus] = useState<ReviewStatus>('all');
  const [appliedStarFilters, setAppliedStarFilters] = useState<Set<StarFilter>>(
    new Set([5, 4, 3, 2, 1]),
  );
  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [replyingReview, setReplyingReview] = useState<ShopReview | null>(null);

  const { stats, isLoading: isStatsLoading } = useGetShopReviewStats();
  const { counts, isLoading: isCountsLoading } = useGetShopReviewCounts();

  const ratingsParam = appliedStarFilters.size === 5 ? undefined : Array.from(appliedStarFilters);

  const {
    reviews,
    isLoading: isReviewsLoading,
    isFetching: isReviewsFetching,
  } = useGetShopReviews({
    ratings: ratingsParam,
    status: appliedStatus,
    page,
    pageSize: PAGE_SIZE,
  });

  const orderItemIds = useMemo(
    () => Array.from(new Set(reviews.map((r) => r.orderItemId))),
    [reviews],
  );
  const { orderItems, isLoading: isOrderItemsLoading } = useGetOrderItemInfo(orderItemIds);
  const orderItemMap = useMemo(() => {
    const map: Record<string, OrderItemInfo> = {};
    orderItems.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [orderItems]);

  const thumbnailAssetIds = useMemo(
    () => Array.from(new Set(orderItems.map((item) => item.thumbnailUrl))),
    [orderItems],
  );
  const reviewMediaAssetIds = useMemo(
    () => Array.from(new Set(reviews.flatMap((r) => r.mediaAssetIds))),
    [reviews],
  );

  const allAssetIds = useMemo(
    () => Array.from(new Set([...thumbnailAssetIds, ...reviewMediaAssetIds])),
    [thumbnailAssetIds, reviewMediaAssetIds],
  );
  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets(
    { assetIds: allAssetIds },
    { enabled: allAssetIds.length > 0 },
  );
  const assetMap = useMemo(() => {
    const map: Record<string, AssetInfo> = {};
    assetsData?.items.forEach((item) => {
      if (item.found) map[item.id] = item.asset;
    });
    return map;
  }, [assetsData]);
  const isAssetsLoading = allAssetIds.length > 0 && isAssetsPending;

  const thumbnailUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    thumbnailAssetIds.forEach((id) => {
      const asset = assetMap[id];
      if (asset) map[id] = asset.publicUrl;
    });
    return map;
  }, [assetMap, thumbnailAssetIds]);

  const isThumbnailsLoading = isAssetsLoading;
  const isMediaLoading = isAssetsLoading;

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
      if (item.found) map[item.ownerId] = item.asset.publicUrl;
    });
    return map;
  }, [avatarsData]);
  const isAvatarsLoading = buyerIds.length > 0 && isAvatarsPending;

  const displayedReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (fromDate && new Date(review.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(review.createdAt) > new Date(`${toDate}T23:59:59`)) return false;

      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const orderItem = orderItemMap[review.orderItemId];
        const matches =
          review.buyerDisplayName.toLowerCase().includes(q) ||
          orderItem?.productName.toLowerCase().includes(q) ||
          orderItem?.orderId.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [reviews, fromDate, toDate, searchText, orderItemMap]);

  const toggleStar = (star: StarFilter) => {
    setStarFilters((prev) => {
      const next = new Set(prev);
      if (next.has(star)) {
        next.delete(star);
      } else {
        next.add(star);
      }
      return next;
    });
  };

  const toggleAllStars = () => {
    setStarFilters((prev) => (prev.size === 5 ? new Set() : new Set([5, 4, 3, 2, 1])));
  };

  const handleApply = () => {
    setAppliedStatus(status);
    setAppliedStarFilters(starFilters);
    setPage(1);
  };

  const handleReset = () => {
    setStatus('all');
    setStarFilters(new Set([5, 4, 3, 2, 1]));
    setAppliedStatus('all');
    setAppliedStarFilters(new Set([5, 4, 3, 2, 1]));
    setSearchText('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const isFirstReviewsLoad = isReviewsLoading && reviews.length === 0;

  return (
    <div>
      <SellerBreadcrumb
        items={[
          { label: 'Trang Chủ', path: '/seller' },
          { label: 'Chăm Sóc Khách Hàng' },
          { label: 'Quản Lý Đánh Giá' },
        ]}
      />
      <div className='space-y-4'>
        <div className='flex gap-4'>
          <div className='flex-1 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-base font-medium text-slate-800'>
                Đánh Giá Shop{' '}
                {isStatsLoading || !stats ? (
                  <span className='inline-block h-4 w-16 animate-pulse rounded bg-slate-200 align-middle' />
                ) : (
                  <span className='text-[#EE4D2D]'>
                    {stats.overallRating.toFixed(1)}
                    <span className='text-slate-500'>/5</span>
                  </span>
                )}
              </h2>
            </div>

            <div className='grid grid-cols-3 gap-4 border border-slate-100 p-5'>
              {isStatsLoading || !stats ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className='h-4 w-32 animate-pulse rounded bg-slate-200' />
                    <div className='mt-2 h-7 w-16 animate-pulse rounded bg-slate-200' />
                    <div className='mt-2 h-3 w-28 animate-pulse rounded bg-slate-200' />
                  </div>
                ))
              ) : (
                <>
                  <StatBox
                    label='Tổng lượt đánh giá'
                    value={String(stats.totalReviews)}
                    trend={stats.totalReviewsTrendPercent}
                  />
                  <StatBox
                    label='Tỷ lệ đánh giá đơn hàng'
                    value={`${stats.orderReviewRate}%`}
                    trend={0}
                  />
                  <StatBox
                    label='Tỷ lệ đánh giá tốt'
                    value={`${stats.goodReviewRate}%`}
                    trend={0}
                  />
                </>
              )}
            </div>

            <div className='mt-4 grid grid-cols-2 gap-4 border border-slate-100 p-5'>
              {isStatsLoading || !stats ? (
                <>
                  <div>
                    <div className='h-4 w-40 animate-pulse rounded bg-slate-200' />
                    <div className='mt-2 h-6 w-24 animate-pulse rounded bg-slate-200' />
                  </div>
                  <div>
                    <div className='h-4 w-32 animate-pulse rounded bg-slate-200' />
                    <div className='mt-2 h-6 w-20 animate-pulse rounded bg-slate-200' />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className='flex items-center gap-1 text-sm text-slate-500'>
                      Đánh giá tiêu cực cần phản hồi
                      <HelpCircle size={14} className='text-slate-400' />
                    </p>
                    <p className='mt-2 text-lg'>
                      <span className='font-medium text-red-500'>{stats.needReplyCount}</span>{' '}
                      <button className='cursor-pointer text-sm text-sky-600 hover:underline'>
                        View &gt;
                      </button>
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      Các đánh giá có 1 và 2 sao cần bạn phản hồi
                    </p>
                  </div>
                  <div>
                    <p className='flex items-center gap-1 text-sm text-slate-500'>
                      Đánh giá gần đây
                      <HelpCircle size={14} className='text-slate-400' />
                    </p>
                    <p className='mt-2 text-lg'>
                      <span className='font-medium text-slate-800'>0</span>{' '}
                      <button className='cursor-pointer text-sm text-sky-600 hover:underline'>
                        View &gt;
                      </button>
                    </p>
                    <p className='mt-1 text-xs text-slate-400'>
                      Đánh giá mới được cập nhật từ lần truy cập trước
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='w-72 bg-white p-6 shadow-sm'>
            <h2 className='mb-4 text-base font-medium text-slate-800'>Công cụ đánh giá</h2>
            <div className='flex gap-3'>
              <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EE4D2D] text-white'>
                🏷️
              </div>
              <div>
                <p className='text-sm font-medium text-slate-800'>Xu Thưởng Đánh Giá</p>
                <p className='mt-1 text-xs text-slate-500'>
                  Tăng lượt đăng giá chất lượng lên +7% bằng cách thưởng thêm xu cho Người mua
                </p>
                <button className='mt-3 cursor-pointer border border-[#EE4D2D] px-4 py-1.5 text-xs text-[#EE4D2D] hover:bg-orange-50'>
                  Truy cập ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-base font-medium text-slate-800'>Danh sách đánh giá shop</h2>

          <div className='mb-4 flex items-center gap-3'>
            <span className='text-sm text-slate-500'>Trạng thái</span>
            {isCountsLoading || !counts
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='h-7 w-24 animate-pulse rounded-full bg-slate-200' />
                ))
              : (
                  [
                    ['all', `Tất cả (${counts.all})`],
                    ['to_reply', `Chưa trả lời (${counts.toReply})`],
                    ['replied', `Đã trả lời (${counts.replied})`],
                  ] as [ReviewStatus, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setStatus(value)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                      status === value
                        ? 'border-[#EE4D2D] text-[#EE4D2D]'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
          </div>

          <div className='mb-4 flex flex-wrap items-center gap-4'>
            <span className='text-sm text-slate-500'>Số sao đánh giá</span>
            {isCountsLoading || !counts ? (
              <div className='flex gap-4'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className='h-4 w-16 animate-pulse rounded bg-slate-200' />
                ))}
              </div>
            ) : (
              <>
                <label className='flex cursor-pointer items-center gap-1.5 text-sm text-slate-600'>
                  <input
                    type='checkbox'
                    checked={starFilters.size === 5}
                    onChange={toggleAllStars}
                    className='h-4 w-4 accent-[#EE4D2D]'
                  />
                  Tất cả
                </label>
                {STAR_OPTIONS.map((star) => (
                  <label
                    key={star}
                    className='flex cursor-pointer items-center gap-1.5 text-sm text-slate-600'
                  >
                    <input
                      type='checkbox'
                      checked={starFilters.has(star)}
                      onChange={() => toggleStar(star)}
                      className='h-4 w-4 accent-[#EE4D2D]'
                    />
                    {star} Sao( {counts.stars[star] ?? 0} )
                  </label>
                ))}
              </>
            )}
          </div>

          <div className='mb-4 flex gap-3'>
            <PlaceholderInput
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              boldPart='Tìm kiếm '
              normalPart='Tên Sản Phẩm, Mã Đơn Hàng, Tên hiển thị người mua'
              className='h-9 w-full border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
              wrapperClassName='flex-[2]'
            />

            <DateRangePopover
              fromDate={fromDate}
              toDate={toDate}
              onApply={(from, to) => {
                setFromDate(from);
                setToDate(to);
              }}
              className='h-9 w-68 cursor-pointer border border-slate-300 px-3 text-sm outline-none focus:border-[#EE4D2D]'
            />

            <button
              onClick={handleApply}
              className='h-9 cursor-pointer border border-[#EE4D2D] px-5 text-sm text-[#EE4D2D] hover:bg-orange-50'
            >
              Áp dụng
            </button>
            <button
              onClick={handleReset}
              className='h-9 cursor-pointer border border-slate-300 px-5 text-sm text-slate-600 hover:bg-slate-50'
            >
              Thiết lập lại
            </button>
          </div>

          <div className='border-t border-slate-100'>
            <div className='grid grid-cols-[2fr_3fr_1fr] gap-4 border-b border-slate-100 py-3 text-sm text-slate-500'>
              <span>Thông tin Sản phẩm</span>
              <span className='pl-4'>Đánh giá của Người mua</span>
            </div>

            {isFirstReviewsLoad ? (
              <div className='divide-y divide-slate-50'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='grid grid-cols-[2fr_3fr_1fr] gap-4 py-5'>
                    <div className='space-y-2'>
                      <div className='h-3.5 w-40 animate-pulse rounded bg-slate-200' />
                      <div className='flex gap-3'>
                        <div className='h-14 w-14 animate-pulse bg-slate-200' />
                        <div className='space-y-2'>
                          <div className='h-3.5 w-32 animate-pulse rounded bg-slate-200' />
                          <div className='h-3 w-40 animate-pulse rounded bg-slate-200' />
                        </div>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='h-3.5 w-24 animate-pulse rounded bg-slate-200' />
                      <div className='h-3.5 w-full animate-pulse rounded bg-slate-200' />
                    </div>
                    <div className='flex justify-end'>
                      <div className='h-8 w-16 animate-pulse rounded bg-slate-200' />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedReviews.length === 0 ? (
              <div className='flex h-40 items-center justify-center text-sm text-slate-400'>
                Chưa có đánh giá nào
              </div>
            ) : (
              <div className={`divide-y divide-slate-50 ${isReviewsFetching ? 'opacity-60' : ''}`}>
                {displayedReviews.map((review) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    orderItem={orderItemMap[review.orderItemId]}
                    isOrderItemLoading={isOrderItemsLoading}
                    thumbnailUrl={
                      orderItemMap[review.orderItemId]
                        ? thumbnailUrlMap[orderItemMap[review.orderItemId].thumbnailUrl]
                        : undefined
                    }
                    isThumbnailLoading={isThumbnailsLoading}
                    mediaAssetMap={assetMap}
                    isMediaLoading={isMediaLoading}
                    avatarUrl={avatarUrlMap[review.buyerId]}
                    isAvatarLoading={isAvatarsLoading}
                    onReply={setReplyingReview}
                  />
                ))}
              </div>
            )}
          </div>

          {!isFirstReviewsLoad && displayedReviews.length > 0 && (
            <div className='mt-4 flex items-center justify-center gap-3'>
              <button
                type='button'
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className='h-8 cursor-pointer px-3 text-sm text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40'
              >
                Trước
              </button>
              <span className='flex h-8 w-8 items-center justify-center rounded-sm bg-[#EE4D2D] text-sm text-white'>
                {page}
              </span>
              <button
                type='button'
                disabled={reviews.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
                className='h-8 cursor-pointer px-3 text-sm text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40'
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {replyingReview && (
        <ReplyModal review={replyingReview} onClose={() => setReplyingReview(null)} />
      )}
    </div>
  );
}
