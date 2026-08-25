import { useMemo, useState, type ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProductCard, CategorySidebar } from '@/components';
import { type Product } from '@/types';
import {
  useGetProductViewsByCondition,
  useProductThumbnails,
  ProductConditionSortBy,
  type GetProductViewsByConditionItem,
} from '@/hooks';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function toProductCardData(item: GetProductViewsByConditionItem): Product {
  return {
    productId: item.id,
    shopId: '',
    shopName: '',
    name: item.name,
    description: '',
    brand: null,
    tags: [],
    searchableSpecs: '',
    thumbnailUrl: item.thumbnailUrl,
    location: item.location,
    categoryPath: [],
    priceMin: String(item.priceMin),
    priceMax: String(item.priceMax),
    originalPriceMin: item.originalPriceMin != null ? String(item.originalPriceMin) : null,
    discountPercent: item.discountPercent,
    stockTotal: item.stockTotal,
    isOutOfStock: item.isOutOfStock,
    ratingAverage: item.ratingAverage,
    ratingCount: item.ratingCount,
    soldCount: item.soldCount,
    syncedAt: '',
  };
}

const SORT_TABS = [
  { label: 'Phổ Biến', value: undefined },
  { label: 'Mới Nhất', value: ProductConditionSortBy.Newest },
  { label: 'Bán Chạy', value: ProductConditionSortBy.BestSelling },
] as const;

const PRICE_SORT_OPTIONS = [
  { label: 'Giá: Thấp đến Cao', value: ProductConditionSortBy.PriceAsc },
  { label: 'Giá: Cao đến Thấp', value: ProductConditionSortBy.PriceDesc },
] as const;

function CategoryFilterBar({
  sortBy,
  onChangeSort,
  page,
  totalPages,
  onChangePage,
}: {
  sortBy?: ProductConditionSortBy;
  onChangeSort: (value?: ProductConditionSortBy) => void;
  page: number;
  totalPages: number;
  onChangePage: (page: number) => void;
}) {
  return (
    <div className='mb-4 flex flex-wrap items-center gap-2 bg-slate-200/60 p-3 text-sm'>
      <span className='mr-1 text-slate-600'>Sắp xếp theo</span>

      {SORT_TABS.map((tab) => {
        const active = sortBy === tab.value;
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

      {PRICE_SORT_OPTIONS.map((opt) => {
        const active = sortBy === opt.value;
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

      <div className='ml-auto flex items-center gap-3'>
        <span className='text-slate-600'>
          <span className='text-[#EE4D2D]'>{page}</span>/{totalPages || 1}
        </span>
        <div className='flex items-center gap-1'>
          <button
            onClick={() => onChangePage(page - 1)}
            disabled={page <= 1}
            className='flex h-8 w-8 items-center justify-center bg-white text-slate-500 hover:enabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onChangePage(page + 1)}
            disabled={page >= totalPages}
            className='flex h-8 w-8 items-center justify-center bg-white text-slate-500 hover:enabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const PROVINCE_OPTIONS = [
  { label: 'Thành phố Hà Nội', value: 'Thành phố Hà Nội' },
  { label: 'Thành phố Hồ Chí Minh', value: 'Thành phố Hồ Chí Minh' },
  { label: 'Thành phố Đà Nẵng', value: 'Thành phố Đà Nẵng' },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className='border-b border-slate-100 p-3'>
      <p className='mb-2 text-sm font-semibold text-black'>{title}</p>
      {children}
    </div>
  );
}

function CategoryFilters({
  province,
  ratingFrom,
  priceMin,
  priceMax,
  inStockOnly,
  lowStockOnly,
  onChange,
}: {
  province?: string;
  ratingFrom?: number;
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
  onChange: (patch: {
    province?: string | null;
    ratingFrom?: number | null;
    priceMin?: number | null;
    priceMax?: number | null;
    inStockOnly?: boolean | null;
    lowStockOnly?: boolean | null;
  }) => void;
}) {
  const [priceMinInput, setPriceMinInput] = useState(priceMin != null ? String(priceMin) : '');
  const [priceMaxInput, setPriceMaxInput] = useState(priceMax != null ? String(priceMax) : '');

  const applyPriceRange = () => {
    onChange({
      priceMin: priceMinInput ? Number(priceMinInput) : null,
      priceMax: priceMaxInput ? Number(priceMaxInput) : null,
    });
  };

  return (
    <aside className='mt-3 w-full rounded-sm bg-white shadow-sm'>
      <FilterSection title='Khu Vực'>
        <div className='space-y-2'>
          {PROVINCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className='flex cursor-pointer items-center gap-2 text-sm text-slate-700'
            >
              <input
                type='radio'
                name='province'
                checked={province === opt.value}
                onChange={() => onChange({ province: opt.value })}
                className='h-4 w-4 accent-[#EE4D2D]'
              />
              {opt.label}
            </label>
          ))}
          {province && (
            <button
              type='button'
              onClick={() => onChange({ province: null })}
              className='text-xs text-slate-400 hover:text-[#EE4D2D]'
            >
              Bỏ chọn khu vực
            </button>
          )}
        </div>
      </FilterSection>

      <FilterSection title='Khoảng Giá'>
        <div className='flex items-center gap-2'>
          <input
            type='number'
            placeholder='₫ TỪ'
            value={priceMinInput}
            onChange={(e) => setPriceMinInput(e.target.value)}
            className='w-full border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-[#EE4D2D]'
          />
          <span className='text-slate-300'>-</span>
          <input
            type='number'
            placeholder='₫ ĐẾN'
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
            className='w-full border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-[#EE4D2D]'
          />
        </div>
        <button
          type='button'
          onClick={applyPriceRange}
          className='mt-2 w-full bg-[#EE4D2D] py-1.5 text-sm text-white hover:opacity-90'
        >
          Áp Dụng
        </button>
      </FilterSection>

      <FilterSection title='Đánh Giá'>
        <div className='space-y-2'>
          {RATING_OPTIONS.map((star) => (
            <label
              key={star}
              className='flex cursor-pointer items-center gap-2 text-sm text-slate-700'
            >
              <input
                type='radio'
                name='rating'
                checked={ratingFrom === star}
                onChange={() => onChange({ ratingFrom: star })}
                className='h-4 w-4 accent-[#EE4D2D]'
              />
              <span className='flex items-center gap-1'>
                {'★'.repeat(star)}
                {'☆'.repeat(5 - star)}
                <span className='ml-1 text-slate-500'>trở lên</span>
              </span>
            </label>
          ))}
          {ratingFrom != null && (
            <button
              type='button'
              onClick={() => onChange({ ratingFrom: null })}
              className='text-xs text-slate-400 hover:text-[#EE4D2D]'
            >
              Bỏ chọn đánh giá
            </button>
          )}
        </div>
      </FilterSection>

      <FilterSection title='Tình Trạng'>
        <div className='space-y-2'>
          <label className='flex cursor-pointer items-center gap-2 text-sm text-slate-700'>
            <input
              type='checkbox'
              checked={!!inStockOnly}
              onChange={(e) => onChange({ inStockOnly: e.target.checked ? true : null })}
              className='h-4 w-4 accent-[#EE4D2D]'
            />
            Còn hàng
          </label>
          <label className='flex cursor-pointer items-center gap-2 text-sm text-slate-700'>
            <input
              type='checkbox'
              checked={!!lowStockOnly}
              onChange={(e) => onChange({ lowStockOnly: e.target.checked ? true : null })}
              className='h-4 w-4 accent-[#EE4D2D]'
            />
            Sắp hết hàng
          </label>
        </div>
      </FilterSection>
    </aside>
  );
}

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? String(DEFAULT_PAGE));
  const pageSize = Number(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE));
  const sortByParam = searchParams.get('sortBy');
  const sortBy = sortByParam != null ? (Number(sortByParam) as ProductConditionSortBy) : undefined;
  const province = searchParams.get('province') ?? undefined;
  const ratingFromParam = searchParams.get('ratingFrom');
  const ratingFrom = ratingFromParam != null ? Number(ratingFromParam) : undefined;
  const priceMinParam = searchParams.get('priceMin');
  const priceMin = priceMinParam != null ? Number(priceMinParam) : undefined;
  const priceMaxParam = searchParams.get('priceMax');
  const priceMax = priceMaxParam != null ? Number(priceMaxParam) : undefined;
  const inStockOnly = searchParams.get('inStockOnly') === 'true' ? true : undefined;
  const lowStockOnly = searchParams.get('lowStockOnly') === 'true' ? true : undefined;

  const { data, isPending, errorMessage } = useGetProductViewsByCondition({
    categorySlug: slug,
    province,
    sortBy,
    page,
    pageSize,
    ratingFrom,
    priceMin,
    priceMax,
    inStockOnly,
    lowStockOnly,
  });

  const items = useMemo(() => data?.items.map(toProductCardData) ?? [], [data]);
  const totalPages = data?.totalPages ?? 1;

  const thumbnailMap = useProductThumbnails(items.map((p) => p.thumbnailUrl));

  const updateParams = (
    patch: Record<string, string | number | boolean | null | undefined>,
    resetPage = true,
  ) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    if (resetPage) next.set('page', String(DEFAULT_PAGE));
    setSearchParams(next);
  };

  const handleChangeSort = (value?: ProductConditionSortBy) => {
    updateParams({ sortBy: value ?? null });
  };

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    updateParams({ page: nextPage }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeFilters = (patch: {
    province?: string | null;
    ratingFrom?: number | null;
    priceMin?: number | null;
    priceMax?: number | null;
    inStockOnly?: boolean | null;
    lowStockOnly?: boolean | null;
  }) => {
    updateParams(patch);
  };

  return (
    <div className='bg-slate-100'>
      <div className='mx-auto max-w-7xl px-4 py-6'>
        <div className='flex items-start gap-4'>
          <div className='hidden w-56 shrink-0 md:block'>
            <CategorySidebar />
            <CategoryFilters
              province={province}
              ratingFrom={ratingFrom}
              priceMin={priceMin}
              priceMax={priceMax}
              inStockOnly={inStockOnly}
              lowStockOnly={lowStockOnly}
              onChange={handleChangeFilters}
            />
          </div>

          <div className='min-w-0 flex-1'>
            <CategoryFilterBar
              sortBy={sortBy}
              onChangeSort={handleChangeSort}
              page={page}
              totalPages={totalPages}
              onChangePage={handleChangePage}
            />

            {isPending ? (
              <div className='grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                {Array.from({ length: pageSize }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : errorMessage ? (
              <div className='p-6 text-center text-sm text-red-500'>{errorMessage}</div>
            ) : items.length === 0 ? (
              <div className='p-6 text-center text-sm text-black'>Không có sản phẩm nào.</div>
            ) : (
              <div className='grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                {items.map((product) => (
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
      </div>
    </div>
  );
}
