import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch, useProductThumbnails } from '@/hooks';
import { ProductCard } from '@/components';

function ProductCardSkeleton() {
  return (
    <div className='overflow-hidden bg-white shadow-sm'>
      <div className='aspect-square animate-pulse bg-slate-200' />
      <div className='space-y-2 p-2'>
        <div className='h-3 w-full animate-pulse bg-slate-200' />
        <div className='h-3 w-2/3 animate-pulse bg-slate-200' />
        <div className='h-3 w-1/2 animate-pulse bg-slate-200' />
      </div>
    </div>
  );
}

const SORT_TABS = [
  { label: 'Liên Quan', value: undefined },
  { label: 'Bán Chạy', value: 'soldCount:desc' },
  { label: 'Đánh Giá', value: 'rating:desc' },
] as const;

const PRICE_OPTIONS = [
  { label: 'Giá: Thấp đến Cao', value: 'price:asc' },
  { label: 'Giá: Cao đến Thấp', value: 'price:desc' },
] as const;

function FilterBar({
  sort,
  onChangeSort,
}: {
  sort?: string;
  onChangeSort: (value?: string) => void;
}) {
  return (
    <div className='mb-4 flex flex-wrap items-center gap-2 bg-slate-200/60 p-3 text-sm'>
      <span className='mr-1 text-slate-600'>Sắp xếp theo</span>

      {SORT_TABS.map((tab) => {
        const active = sort === tab.value;
        return (
          <button
            key={tab.label}
            onClick={() => onChangeSort(tab.value)}
            className={`cursor-pointer px-4 py-2 transition-colors ${
              active ? 'bg-[#EE4D2D] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}

      {PRICE_OPTIONS.map((opt) => {
        const active = sort === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChangeSort(active ? undefined : opt.value)}
            className={`cursor-pointer px-4 py-2 transition-colors ${
              active ? 'bg-[#EE4D2D] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function SearchResult() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? undefined;
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const category = searchParams.get('category') ?? undefined;
  const sort = searchParams.get('sort') ?? undefined;
  const page = searchParams.get('page');
  const location = searchParams.get('location') ?? undefined;

  useEffect(() => {
    if (!page) {
      const next = new URLSearchParams(searchParams);
      next.set('page', '1');
      setSearchParams(next, { replace: true });
    }
  }, [page, searchParams, setSearchParams]);

  const currentPage = page ? Number(page) : 1;

  const handleChangeSort = (value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set('sort', value);
    } else {
      next.delete('sort');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const { data, isPending, errorMessage } = useSearch({
    q,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    category,
    sort: sort as any,
    page: currentPage,
    location,
  });

  const products = data?.items ?? [];

  const thumbnailMap = useProductThumbnails(products.map((p) => p.thumbnailUrl));

  if (errorMessage) {
    return <div className='p-6 text-center text-sm text-red-500'>{errorMessage}</div>;
  }

  return (
    <div className='bg-slate-100'>
      <div className='mx-auto max-w-7xl px-4'>
        {q && (
          <div className='my-6 text-center text-base'>
            Kết quả tìm kiếm cho từ khoá <span className='text-[#EE4D2D]'>'{q}'</span>
          </div>
        )}

        <FilterBar sort={sort} onChangeSort={handleChangeSort} />

        {isPending ? (
          <div className='grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className='p-6 text-center text-sm text-black'>Không tìm thấy sản phẩm nào.</div>
        ) : (
          <div className='grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {products.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                thumbnail={thumbnailMap.get(product.thumbnailUrl) ?? { status: 'loading' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
