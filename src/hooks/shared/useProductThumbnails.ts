import { useMemo } from 'react';
import { useGetMultipleAssets } from '@/hooks';
import type { ThumbnailState } from '@/types';

const useProductThumbnails = (assetIds: string[]) => {
  const uniqueIds = useMemo(() => Array.from(new Set(assetIds.filter(Boolean))), [assetIds]);

  const { data, isPending, errorMessage } = useGetMultipleAssets({ assetIds: uniqueIds });

  return useMemo(() => {
    const map = new Map<string, ThumbnailState>();

    if (uniqueIds.length === 0) return map;

    if (errorMessage) {
      uniqueIds.forEach((id) => map.set(id, { status: 'error' }));
      return map;
    }

    if (isPending || !data) {
      uniqueIds.forEach((id) => map.set(id, { status: 'loading' }));
      return map;
    }

    data.items.forEach((item) => {
      map.set(
        item.id,
        item.found ? { status: 'ready', url: item.asset.publicUrl } : { status: 'error' },
      );
    });

    return map;
  }, [data, isPending, errorMessage, uniqueIds]);
};

export default useProductThumbnails;
