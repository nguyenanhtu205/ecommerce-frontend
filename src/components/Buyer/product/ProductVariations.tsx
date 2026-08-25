import AssetImage from './AssetImage';
import type { GetProductViewByIdResponse } from '@/hooks';

type VariantGroup = GetProductViewByIdResponse['variantGroups'][number];

type ProductVariationsProps = {
  variantGroups: VariantGroup[];
  selected: Record<string, string>;
  onChange: (groupName: string, value: string) => void;
  assetMap: Record<string, string>;
  isLoadingAssets: boolean;
};

export default function ProductVariations({
  variantGroups,
  selected,
  onChange,
  assetMap,
  isLoadingAssets,
}: ProductVariationsProps) {
  if (variantGroups.length === 0) return null;

  return (
    <div className='space-y-4'>
      {variantGroups.map((group) => (
        <div key={group.name} className='flex items-start gap-4'>
          <span className='w-20 shrink-0 pt-1.5 text-sm text-slate-500'>{group.name}</span>
          <div className='flex flex-wrap gap-2'>
            {group.options.map((option) => {
              const isActive = selected[group.name] === option.value;
              return (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => onChange(group.name, option.value)}
                  className={`flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm transition ${
                    isActive
                      ? 'border-[#EE4D2D] bg-[#FFF4F1] text-[#EE4D2D]'
                      : 'border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {option.mediaId && (
                    <AssetImage
                      assetId={option.mediaId}
                      assetMap={assetMap}
                      isLoading={isLoadingAssets}
                      alt={option.value}
                      className='h-6 w-6 rounded-sm object-cover'
                    />
                  )}
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
