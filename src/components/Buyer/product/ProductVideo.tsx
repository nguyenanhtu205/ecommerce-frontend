type ProductVideoProps = {
  videoId: string;
  assetMap: Record<string, string>;
  isLoadingAssets: boolean;
};

export default function ProductVideo({ videoId, assetMap, isLoadingAssets }: ProductVideoProps) {
  const url = assetMap[videoId];

  if (isLoadingAssets || !url) {
    return <div className='aspect-video w-full max-w-2xl animate-pulse rounded-sm bg-slate-200' />;
  }

  return <video controls className='aspect-video w-full max-w-2xl rounded-sm bg-black' src={url} />;
}
