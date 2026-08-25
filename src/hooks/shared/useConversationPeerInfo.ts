import { useMemo } from 'react';
import { useGetMultipleAssets, useGetShopsForChat, useGetUsersForChat } from '@/hooks';

export type PeerInfo = {
  name: string | null;
  avatarUrl: string | null;
  isNameLoading: boolean;
  isAvatarLoading: boolean;
  found: boolean;
};

function getAvatarAssetId(
  item: { userAvatarUrl: string | null } | { shopAvatarUrl: string | null },
) {
  return 'userAvatarUrl' in item ? item.userAvatarUrl : item.shopAvatarUrl;
}

const useConversationPeerInfo = (peerIds: string[], role: string) => {
  const uniqueIds = useMemo(() => Array.from(new Set(peerIds)), [peerIds.join(',')]);

  const isSeller = role === 'seller';

  const { data: usersData, isPending: isUsersPending } = useGetUsersForChat(
    { userIds: uniqueIds },
    { enabled: isSeller && uniqueIds.length > 0 },
  );
  const { data: shopsData, isPending: isShopsPending } = useGetShopsForChat(
    { shopIds: uniqueIds },
    { enabled: !isSeller && uniqueIds.length > 0 },
  );

  const infoList = isSeller ? usersData : shopsData;
  const isInfoPending = uniqueIds.length > 0 && (isSeller ? isUsersPending : isShopsPending);

  const avatarAssetIds = useMemo(() => {
    if (!infoList) return [];
    return infoList.map((item) => getAvatarAssetId(item)).filter((id): id is string => !!id);
  }, [infoList]);

  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets(
    { assetIds: avatarAssetIds },
    { enabled: avatarAssetIds.length > 0 },
  );

  const resolvedAssetMap = useMemo(() => {
    const map = new Map<string, string>();
    assetsData?.items.forEach((item) => {
      if (item.found) map.set(item.id, item.asset.publicUrl);
    });
    return map;
  }, [assetsData]);

  return useMemo(() => {
    const map = new Map<string, PeerInfo>();

    uniqueIds.forEach((id) => {
      const item = infoList?.find((i) => i.id === id);

      if (!infoList || isInfoPending) {
        map.set(id, {
          name: null,
          avatarUrl: null,
          isNameLoading: true,
          isAvatarLoading: true,
          found: true,
        });
        return;
      }

      if (!item) {
        map.set(id, {
          name: null,
          avatarUrl: null,
          isNameLoading: false,
          isAvatarLoading: false,
          found: false,
        });
        return;
      }

      const avatarAssetId = getAvatarAssetId(item);

      if (!avatarAssetId) {
        map.set(id, {
          name: item.name,
          avatarUrl: null,
          isNameLoading: false,
          isAvatarLoading: false,
          found: true,
        });
        return;
      }

      const resolvedUrl = resolvedAssetMap.get(avatarAssetId) ?? null;
      map.set(id, {
        name: item.name,
        avatarUrl: resolvedUrl,
        isNameLoading: false,
        isAvatarLoading: !resolvedUrl && isAssetsPending,
        found: true,
      });
    });

    return map;
  }, [uniqueIds, infoList, isInfoPending, isSeller, resolvedAssetMap, isAssetsPending]);
};

export default useConversationPeerInfo;
