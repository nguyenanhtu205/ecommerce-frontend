import { useState } from 'react';
import AssetImage from './AssetImage';

type ProductGalleryProps = {
  thumbnailId: string;
  galleryIds: string[];
  assetMap: Record<string, string>;
  isLoadingAssets: boolean;
  productName: string;
};

export default function ProductGallery({
  thumbnailId,
  galleryIds,
  assetMap,
  isLoadingAssets,
  productName,
}: ProductGalleryProps) {
  const images = [thumbnailId, ...galleryIds];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeId = images[activeIndex];

  return (
    <div className='w-full max-w-105 shrink-0'>
      <div className='aspect-square overflow-hidden rounded-sm border border-slate-100 bg-white'>
        <AssetImage
          assetId={activeId}
          assetMap={assetMap}
          isLoading={isLoadingAssets}
          alt={productName}
          className='h-full w-full object-cover'
        />
      </div>
      <div className='mt-2.5 flex gap-2'>
        {images.map((imgId, idx) => (
          <button
            key={`${imgId}-${idx}`}
            type='button'
            onClick={() => setActiveIndex(idx)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-sm border-2 ${
              idx === activeIndex ? 'border-[#EE4D2D]' : 'border-transparent'
            }`}
          >
            <AssetImage
              assetId={imgId}
              assetMap={assetMap}
              isLoading={isLoadingAssets}
              alt=''
              className='h-full w-full object-cover'
            />
          </button>
        ))}
      </div>
    </div>
  );
}
