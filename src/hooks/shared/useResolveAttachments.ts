import { useMemo } from 'react';
import { useGetMultipleAssets } from '@/hooks';

export type ResolvedAsset = { url: string; kind: 'image' | 'video' };

const useResolveAttachments = (assetIds: string[], localCache: Map<string, ResolvedAsset>) => {
  const missingIds = useMemo(
    () => assetIds.filter((id) => !localCache.has(id)),
    [assetIds.join(','), localCache],
  );

  const { data } = useGetMultipleAssets(
    { assetIds: missingIds },
    { enabled: missingIds.length > 0 },
  );

  const resolved = new Map(localCache);
  data?.items.forEach((item) => {
    if (item.found) {
      resolved.set(item.id, {
        url: item.asset.publicUrl,
        kind: item.asset.mediaType === 'VIDEO' ? 'video' : 'image',
      });
    }
  });
  return resolved;
};

export default useResolveAttachments;
