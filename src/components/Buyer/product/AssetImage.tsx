type AssetImageProps = {
  assetId?: string | null;
  assetMap: Record<string, string>;
  isLoading: boolean;
  alt: string;
  className?: string;
};

export default function AssetImage({
  assetId,
  assetMap,
  isLoading,
  alt,
  className,
}: AssetImageProps) {
  const url = assetId ? assetMap[assetId] : undefined;

  if (!assetId || isLoading || !url) {
    return <div className={`animate-pulse bg-slate-300 ${className ?? ''}`} />;
  }

  return <img src={url} alt={alt} className={className} />;
}
