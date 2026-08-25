import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  useGetShopInformationForBuyer,
  useGetProductViewsByShop,
  useGetCategoriesByShop,
  useProductThumbnails,
  ProductSortBy,
  type GetProductViewsByShopItem,
} from '@/hooks';
import { ShopInfoCard, ProductCard } from '@/components';
import { type Product, type ThumbnailState } from '@/types';
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

function toProductCardData(
  item: GetProductViewsByShopItem,
  shopId: string,
  shopName: string,
): Product {
  return {
    productId: item.id,
    shopId,
    shopName,
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
  { label: 'Mới Nhất', value: ProductSortBy.Newest },
  { label: 'Bán Chạy', value: ProductSortBy.BestSelling },
] as const;

const PRICE_SORT_OPTIONS = [
  { label: 'Giá: Thấp đến Cao', value: ProductSortBy.PriceAsc },
  { label: 'Giá: Cao đến Thấp', value: ProductSortBy.PriceDesc },
] as const;

function ShopFilterBar({
  sortBy,
  onChangeSort,
  page,
  totalPages,
  onChangePage,
}: {
  sortBy?: ProductSortBy;
  onChangeSort: (value?: ProductSortBy) => void;
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

function ShopCategorySidebar({
  shopId,
  activeCategoryId,
  onSelectCategory,
}: {
  shopId: string;
  activeCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
}) {
  const { data, isPending, errorMessage } = useGetCategoriesByShop({ shopId });

  if (isPending) {
    return (
      <aside className='w-full rounded-sm bg-white p-3 shadow-sm'>
        <div className='space-y-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-4 w-4/5 animate-pulse rounded bg-slate-200' />
          ))}
        </div>
      </aside>
    );
  }

  if (errorMessage || !data || data.length === 0) {
    return null;
  }

  return (
    <aside className='w-full rounded-sm bg-white shadow-sm'>
      <div className='border-b border-slate-100 p-3'>
        <span className='text-sm font-semibold text-black'>Danh Mục Của Shop</span>
      </div>
      <nav className='py-1'>
        <button
          type='button'
          onClick={() => onSelectCategory(undefined)}
          className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition ${
            !activeCategoryId ? 'font-medium text-[#EE4D2D]' : 'text-slate-700 hover:text-[#EE4D2D]'
          }`}
        >
          Tất cả sản phẩm
        </button>
        {data.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              type='button'
              onClick={() => onSelectCategory(category.id)}
              className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition ${
                isActive ? 'font-medium text-[#EE4D2D]' : 'text-slate-700 hover:text-[#EE4D2D]'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default function Shop() {
  const { id: shopId = '' } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? String(DEFAULT_PAGE));
  const sortByParam = searchParams.get('sortBy');
  const sortBy = sortByParam != null ? (Number(sortByParam) as ProductSortBy) : undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;

  const { data: shop } = useGetShopInformationForBuyer(shopId);

  const { data, isPending, errorMessage } = useGetProductViewsByShop({
    shopId,
    categoryId,
    sortBy,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const items = useMemo(
    () => data?.items.map((item) => toProductCardData(item, shopId, shop?.name ?? '')) ?? [],
    [data, shopId, shop?.name],
  );
  const totalPages = data?.totalPages ?? 1;

  const thumbnailMap = useProductThumbnails(items.map((p) => p.thumbnailUrl));

  const updateParams = (
    patch: Record<string, string | number | undefined | null>,
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

  const handleChangeSort = (value?: ProductSortBy) => {
    updateParams({ sortBy: value ?? null });
  };

  const handleChangeCategory = (nextCategoryId?: string) => {
    updateParams({ categoryId: nextCategoryId ?? null });
  };

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    updateParams({ page: nextPage }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const thumbnails: Record<string, ThumbnailState> = {};
  items.forEach((p) => {
    thumbnails[p.productId] = thumbnailMap.get(p.thumbnailUrl) ?? { status: 'loading' };
  });

  return (
    <div className='bg-slate-100'>
      <div className='mx-auto max-w-7xl px-4 py-6'>
        <ShopInfoCard shopId={shopId} onShopPage={true} shopDescription={shop?.description} />

        <div className='mt-3 flex items-start gap-4'>
          <div className='hidden w-56 shrink-0 md:block'>
            <ShopCategorySidebar
              shopId={shopId}
              activeCategoryId={categoryId}
              onSelectCategory={handleChangeCategory}
            />
          </div>

          <div className='min-w-0 flex-1'>
            <ShopFilterBar
              sortBy={sortBy}
              onChangeSort={handleChangeSort}
              page={page}
              totalPages={totalPages}
              onChangePage={handleChangePage}
            />

            {isPending ? (
              <div className='grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : errorMessage ? (
              <div className='p-6 text-center text-sm text-red-500'>{errorMessage}</div>
            ) : items.length === 0 ? (
              <div className='p-6 text-center text-sm text-black'>Shop chưa có sản phẩm nào.</div>
            ) : (
              <div className='grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                {items.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    thumbnail={thumbnails[product.productId]}
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
