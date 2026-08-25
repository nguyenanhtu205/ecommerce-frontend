import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ProductGallery,
  ProductVideo,
  ProductVariations,
  ProductActions,
  ProductSpecifications,
  Breadcrumb,
  ProductReviews,
  ShopOtherProducts,
  ShopInfoCard,
  SimilarProducts,
} from '@/components';
import { useGetProductViewById, useGetMultipleAssets } from '@/hooks';

const CONDITION_LABEL: Record<string, string> = {
  New: 'Mới',
  Used: 'Đã qua sử dụng',
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function joinVariation(selected: Record<string, string>) {
  return Object.entries(selected)
    .map(([name, value]) => `${name}: ${value}`)
    .join(' | ');
}

export default function ProductDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: product, isPending, errorMessage } = useGetProductViewById(id);

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isReviewsReady, setIsReviewsReady] = useState(false);
  const [isShopInfoReady, setIsShopInfoReady] = useState(false);
  const [isShopOnVacation, setIsShopOnVacation] = useState(false);

  useEffect(() => {
    if (product && Object.keys(selected).length === 0 && product.variantGroups.length > 0) {
      setSelected(
        Object.fromEntries(product.variantGroups.map((g) => [g.name, g.options[0]?.value ?? ''])),
      );
    }
  }, [product, selected]);

  const assetIds = useMemo(() => {
    if (!product) return [];
    const ids = new Set<string>();
    if (product.thumbnailUrl) ids.add(product.thumbnailUrl);
    product.galleryUrls.forEach((assetId) => ids.add(assetId));
    if (product.videoUrl) ids.add(product.videoUrl);
    product.variantGroups.forEach((group) =>
      group.options.forEach((option) => {
        if (option.mediaId) ids.add(option.mediaId);
      }),
    );
    return Array.from(ids);
  }, [product]);

  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets(
    { assetIds },
    { enabled: assetIds.length > 0 },
  );

  const assetMap = useMemo(() => {
    const map: Record<string, string> = {};
    assetsData?.items.forEach((item) => {
      if (item.found) map[item.id] = item.asset.publicUrl;
    });
    return map;
  }, [assetsData]);

  const isLoadingAssets = assetIds.length > 0 && isAssetsPending;
  const canLoadShopOtherProducts = !isLoadingAssets && isReviewsReady && isShopInfoReady;

  const selectedCombination = useMemo(() => {
    if (!product || product.variantGroups.length === 0) return null;
    const selectedValues = product.variantGroups.map((g) => selected[g.name]);
    if (selectedValues.some((v) => v === undefined)) return null;
    return (
      product.variantCombinations.find(
        (combo) =>
          combo.optionValues.length === selectedValues.length &&
          combo.optionValues.every((v, i) => v === selectedValues[i]),
      ) ?? null
    );
  }, [product, selected]);

  const handleVariationChange = (name: string, value: string) => {
    setSelected((prev) => ({ ...prev, [name]: value }));
  };

  const cartItem = useMemo(() => {
    if (!product || !selectedCombination) return null;
    return {
      combinationId: selectedCombination.combinationId,
      priceSnapshot: selectedCombination.price,
      productId: product.id,
      productName: product.name,
      shopId: product.shopId,
      shopName: product.shopName,
      thumbnailUrl: product.thumbnailUrl,
      variation: joinVariation(selected),
      shippingInfo: product.shippingInfo,
    };
  }, [product, selectedCombination, selected]);

  if (isPending) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-4'>
        <div className='h-4 w-64 animate-pulse rounded bg-slate-200' />
        <div className='mt-3 flex flex-col gap-5 rounded-sm bg-white p-6 shadow-sm md:flex-row'>
          <div className='aspect-square w-full max-w-105 shrink-0 animate-pulse rounded-sm bg-slate-200' />
          <div className='flex-1 space-y-4'>
            <div className='h-6 w-3/4 animate-pulse rounded bg-slate-200' />
            <div className='h-20 w-full animate-pulse rounded bg-slate-200' />
            <div className='h-10 w-1/2 animate-pulse rounded bg-slate-200' />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className='mx-auto max-w-7xl px-4 py-10 text-center text-sm text-slate-500'>
        {errorMessage ?? 'Không tìm thấy sản phẩm.'}
      </div>
    );
  }

  const stock = selectedCombination?.stock ?? product.stockTotal;
  const isPurchasable = !!selectedCombination && selectedCombination.stock > 0;
  const displayPrice = selectedCombination?.price ?? product.priceMin;

  return (
    <div className='mx-auto max-w-7xl px-4 py-4'>
      <Breadcrumb categoryPath={product.categoryPath} productName={product.name} />

      <div className='flex flex-col gap-5 rounded-sm bg-white p-6 shadow-sm md:flex-row'>
        <ProductGallery
          thumbnailId={product.thumbnailUrl}
          galleryIds={product.galleryUrls}
          assetMap={assetMap}
          isLoadingAssets={isLoadingAssets}
          productName={product.name}
        />

        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-lg font-medium text-slate-800'>{product.name}</h1>
            {product.isPreOrder && (
              <span className='shrink-0 rounded-sm bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'>
                Đặt Trước
              </span>
            )}
          </div>

          {product.brand && (
            <p className='mt-1 text-xs text-slate-400'>Thương hiệu: {product.brand}</p>
          )}

          <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500'>
            <span className='flex items-center gap-1 text-[#EE4D2D]'>
              {product.ratingAverage}
              <svg width='14' height='14' viewBox='0 0 24 24' fill='#EE4D2D'>
                <path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z' />
              </svg>
            </span>
            <span className='h-3 w-px bg-slate-200' />
            <span>{product.ratingCount} Đánh Giá</span>
            <span className='h-3 w-px bg-slate-200' />
            <span>Đã bán {product.soldCount}</span>
            <span className='h-3 w-px bg-slate-200' />
            <span>{CONDITION_LABEL[product.condition] ?? product.condition}</span>
            {product.location && (
              <>
                <span className='h-3 w-px bg-slate-200' />
                <span>{product.location}</span>
              </>
            )}
          </div>

          {product.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className='rounded-sm bg-slate-100 px-2 py-0.5 text-xs text-slate-500'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className='mt-4 flex flex-wrap items-baseline gap-3 rounded-sm bg-[#FAFAFA] px-5 py-4'>
            <span className='text-3xl font-medium text-[#EE4D2D]'>{formatPrice(displayPrice)}</span>
            {product.originalPriceMin > displayPrice && (
              <span className='text-base text-slate-400 line-through'>
                {formatPrice(product.originalPriceMin)}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className='rounded-sm bg-[#EE4D2D] px-1.5 py-0.5 text-xs font-medium text-white'>
                -{product.discountPercent}%
              </span>
            )}
            {!selectedCombination && (
              <span className='text-xs text-slate-400'>
                (Khoảng giá {formatPrice(product.priceMin)} - {formatPrice(product.priceMax)})
              </span>
            )}
          </div>

          <div className='mt-5'>
            <ProductVariations
              variantGroups={product.variantGroups}
              selected={selected}
              onChange={handleVariationChange}
              assetMap={assetMap}
              isLoadingAssets={isLoadingAssets}
            />
          </div>

          {!selectedCombination && (
            <p className='mt-3 text-sm text-red-500'>Biến thể này tạm hết hàng</p>
          )}

          {product.isPreOrder && product.preOrderDays != null && (
            <div className='my-2 flex items-start gap-2 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-800'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className='mt-0.5 shrink-0'
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M12 6v6l4 2' />
              </svg>
              <span>
                Đây là hàng đặt trước. Shop sẽ giao hàng trong khoảng{' '}
                <strong>{product.preOrderDays} ngày</strong> kể từ khi đặt (không tính ngày nghỉ lễ,
                Tết và những ngày đơn vị vận chuyển không làm việc).
              </span>
            </div>
          )}
          <div className='mt-5 rounded-sm border border-slate-100 bg-slate-50/50 px-4 py-3'>
            <div className='mb-3 flex items-center gap-2'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className='shrink-0 text-slate-500'
              >
                <rect x='3' y='5' width='18' height='14' rx='2' />
                <path d='M3 10h18' />
              </svg>

              <span className='text-sm font-medium text-slate-700'>Thông tin vận chuyển</span>
            </div>

            <div className='grid grid-cols-1 gap-2 text-sm text-slate-500 sm:grid-cols-2'>
              <div>
                <span className='text-slate-400'>Khối lượng: </span>
                <span className='text-slate-600'>
                  {product.shippingInfo.weightGrams.toLocaleString('vi-VN')} g
                </span>
              </div>

              <div>
                <span className='text-slate-400'>Kích thước: </span>
                <span className='text-slate-600'>
                  {product.shippingInfo.dimensions.length} × {product.shippingInfo.dimensions.width}{' '}
                  × {product.shippingInfo.dimensions.height} cm
                </span>
              </div>
            </div>
          </div>
          <div className='mt-5 border-t border-slate-100 pt-5'>
            <ProductActions
              quantity={quantity}
              stock={stock}
              disabled={!isPurchasable}
              disabledByVacation={isShopOnVacation}
              cartItem={cartItem}
              onQuantityChange={setQuantity}
            />
          </div>
        </div>
      </div>

      {product.videoUrl && (
        <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-base font-medium tracking-wide text-slate-800'>
            VIDEO SẢN PHẨM
          </h2>
          <ProductVideo
            videoId={product.videoUrl}
            assetMap={assetMap}
            isLoadingAssets={isLoadingAssets}
          />
        </div>
      )}

      <ShopInfoCard
        shopId={product.shopId}
        onShopPage={false}
        onReady={() => setIsShopInfoReady(true)}
        onVacationChange={setIsShopOnVacation}
        shopDescription={null}
      />

      <div className='mt-3 rounded-sm bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-base font-medium tracking-wide text-slate-800'>
          CHI TIẾT SẢN PHẨM
        </h2>
        <ProductSpecifications specifications={product.specifications} />

        <h2 className='mt-6 mb-3 text-base font-medium tracking-wide text-slate-800'>
          MÔ TẢ SẢN PHẨM
        </h2>
        <p className='text-sm leading-relaxed whitespace-pre-line text-slate-600'>
          {product.description}
        </p>
      </div>

      <ProductReviews productId={product.id} onReady={() => setIsReviewsReady(true)} />
      {canLoadShopOtherProducts && (
        <ShopOtherProducts shopId={product.shopId} productId={product.id} />
      )}
      <SimilarProducts
        productId={product.id}
        categorySlug={product.categoryPath[product.categoryPath.length - 1]?.slug}
      />
    </div>
  );
}
