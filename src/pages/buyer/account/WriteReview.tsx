import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CiShop } from 'react-icons/ci';
import { useGetOrderById, useGetPendingReviews, useGetMultipleAssets } from '@/hooks';
import ReviewModal from './ReviewModal';
import StarRating from './StarRating';
import { X } from 'lucide-react';

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

type AssetInfo = { url: string; mediaType: string };

export default function WriteReview() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: orderData, isPending: isOrderPending } = useGetOrderById(orderId ?? '');
  const order = orderData;

  const { data: pendingReviews, isLoading: isPendingReviewsLoading } = useGetPendingReviews();

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState<Record<string, PostedReview>>({});

  const assetIds = useMemo(() => {
    const ids = new Set<string>();
    order?.items.forEach((item) => ids.add(item.thumbnail));
    Object.values(justPosted).forEach((r) => r.mediaAssetIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [order, justPosted]);

  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets({ assetIds });

  const assetMap = useMemo(() => {
    const map: Record<string, AssetInfo> = {};
    assetsData?.items.forEach((entry) => {
      if (entry.found) {
        map[entry.id] = { url: entry.asset.publicUrl, mediaType: entry.asset.mediaType };
      }
    });
    return map;
  }, [assetsData]);

  if (isOrderPending) {
    return <OrderSkeleton />;
  }

  if (!order) {
    return (
      <div className='flex flex-col items-center gap-4 bg-white p-16 text-center'>
        <p className='text-sm text-slate-400'>Không tìm thấy đơn hàng</p>
        <Link
          to='/user/purchase/all'
          className='cursor-pointer border border-[#EE4D2D] px-6 py-2 text-sm text-[#EE4D2D] hover:bg-[#FFF4F1]'
        >
          Quay Lại Trang Đơn Mua
        </Link>
      </div>
    );
  }

  const activeItem = order.items.find((i) => i.id === activeItemId);

  return (
    <div className='bg-white p-6 shadow-sm'>
      <h1 className='mb-1 text-lg font-medium text-slate-800'>Đánh Giá Sản Phẩm</h1>
      <Link
        to={`/shop/${order.shopId}`}
        className='flex cursor-pointer items-center gap-1 text-sm text-slate-500 hover:text-[#EE4D2D]'
      >
        <CiShop className='h-4 w-4' />
        {order.shopName}
      </Link>

      <div className='mt-4 border-b border-slate-100' />

      <div>
        {order.items.map((item) => {
          const pending = pendingReviews?.find((p) => p.orderItemId === item.id);
          const posted = justPosted[item.id];
          const isReviewed = posted ? true : !pending;
          const thumbnail = assetMap[item.thumbnail];
          const thumbnailLoading = isAssetsPending && !thumbnail;

          return (
            <div key={item.id} className='border-b border-slate-100 py-5 last:border-b-0'>
              <div className='flex items-center gap-3'>
                <div className='h-16 w-16 shrink-0 overflow-hidden border border-slate-100 bg-slate-100'>
                  {thumbnailLoading ? (
                    <div className='h-full w-full animate-pulse bg-slate-200' />
                  ) : thumbnail ? (
                    <img src={thumbnail.url} alt='' className='h-full w-full object-cover' />
                  ) : (
                    <div className='h-full w-full bg-slate-100' />
                  )}
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm text-slate-800'>{item.productName}</p>
                  {item.variation && <p className='text-xs text-slate-400'>{item.variation}</p>}
                  <p className='text-xs text-slate-400'>x{item.quantity}</p>
                </div>

                {isPendingReviewsLoading && !posted ? (
                  <div className='h-9 w-32 shrink-0 animate-pulse rounded-sm bg-slate-200' />
                ) : isReviewed ? (
                  <Link
                    to={`/product/${item.productId}`}
                    className='shrink-0 cursor-pointer border border-slate-300 px-5 py-2 text-center text-sm text-slate-600 hover:bg-slate-50'
                  >
                    Xem Đánh Giá
                  </Link>
                ) : (
                  <button
                    type='button'
                    onClick={() => setActiveItemId(item.id)}
                    className='shrink-0 cursor-pointer bg-[#EE4D2D] px-5 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'
                  >
                    Đánh Giá
                  </button>
                )}
              </div>

              {posted && (
                <PostedReviewCard
                  review={posted}
                  assetMap={assetMap}
                  isAssetsPending={isAssetsPending}
                />
              )}
            </div>
          );
        })}
      </div>

      {activeItem && (
        <ReviewModal
          orderItemId={activeItem.id}
          productName={activeItem.productName}
          variation={activeItem.variation}
          thumbnailUrl={assetMap[activeItem.thumbnail]?.url ?? null}
          onClose={() => setActiveItemId(null)}
          onSuccess={(orderItemId, response) => {
            setJustPosted((prev) => ({ ...prev, [orderItemId]: response }));
            setActiveItemId(null);
          }}
        />
      )}
    </div>
  );
}

function PostedReviewCard({
  review,
  assetMap,
  isAssetsPending,
}: {
  review: PostedReview;
  assetMap: Record<string, AssetInfo>;
  isAssetsPending: boolean;
}) {
  const [viewingAsset, setViewingAsset] = useState<AssetInfo | null>(null);

  return (
    <div className='mt-4 ml-19 bg-slate-50 p-4'>
      <p className='mb-2 text-xs text-[#EE4D2D]'>Đánh giá của bạn vừa được gửi</p>
      <StarRating value={review.rating} readOnly size={16} />

      {review.attributes.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500'>
          {review.attributes.map((a) => (
            <span key={a.label}>
              {a.label}: <span className='text-slate-700'>{a.value}</span>
            </span>
          ))}
        </div>
      )}

      {review.comment && <p className='mt-2 text-sm text-slate-700'>{review.comment}</p>}

      {review.mediaAssetIds.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-2'>
          {review.mediaAssetIds.map((id) => {
            const asset = assetMap[id];
            if (isAssetsPending && !asset) {
              return <div key={id} className='h-16 w-16 animate-pulse bg-slate-200' />;
            }
            if (!asset) return null;

            const isVideo = asset.mediaType === 'VIDEO';

            return (
              <button
                key={id}
                type='button'
                onClick={() => setViewingAsset(asset)}
                className='relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden border border-slate-200 bg-black'
              >
                {isVideo ? (
                  <>
                    <video
                      src={asset.url}
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
                  </>
                ) : (
                  <img src={asset.url} alt='' className='h-full w-full object-cover' />
                )}
              </button>
            );
          })}
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
            {viewingAsset.mediaType === 'VIDEO' ? (
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
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className='bg-white p-6 shadow-sm'>
      <div className='mb-1 h-6 w-48 animate-pulse rounded-sm bg-slate-200' />
      <div className='mt-2 h-4 w-32 animate-pulse rounded-sm bg-slate-200' />
      <div className='mt-4 border-b border-slate-100' />
      <div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className='flex items-center gap-3 border-b border-slate-100 py-5 last:border-b-0'
          >
            <div className='h-16 w-16 shrink-0 animate-pulse rounded-sm bg-slate-200' />
            <div className='flex-1 space-y-2'>
              <div className='h-4 w-3/5 animate-pulse rounded-sm bg-slate-200' />
              <div className='h-3 w-2/5 animate-pulse rounded-sm bg-slate-200' />
            </div>
            <div className='h-9 w-32 shrink-0 animate-pulse rounded-sm bg-slate-200' />
          </div>
        ))}
      </div>
    </div>
  );
}
