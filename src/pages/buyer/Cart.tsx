import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartTopBar,
  CartTableHeader,
  ShopCartGroup,
  CartSummaryBar,
  Footer,
  CartEmptyState,
} from '@/components';
import {
  useGetShopGroupedCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useRemoveCartItems,
  useGetMultipleAssets,
} from '@/hooks';

export default function Cart() {
  const navigate = useNavigate();
  const { data: shopGroups = [], isPending, errorMessage } = useGetShopGroupedCart();
  const { updateCartItem } = useUpdateCartItem();
  const { removeCartItem } = useRemoveCartItem();
  const { removeCartItems } = useRemoveCartItems();

  const allItems = useMemo(() => shopGroups.flatMap((group) => group.items), [shopGroups]);

  const assetIds = useMemo(
    () => Array.from(new Set(allItems.map((item) => item.thumbnailUrl))),
    [allItems],
  );

  const { data: assetsData, isPending: isAssetsPending } = useGetMultipleAssets(
    { assetIds },
    { enabled: assetIds.length > 0 },
  );

  const assetMap = useMemo(() => {
    const map: Record<string, string> = {};
    assetsData?.items.forEach((item) => {
      if (item.found) map[item.id] = item.asset.publicUrl;
    });
    return map;
  }, [assetsData]);

  const isLoadingAssets = assetIds.length > 0 && isAssetsPending;

  const allSelected = allItems.length > 0 && allItems.every((item) => item.isSelected);
  const selectedItems = allItems.filter((item) => item.isSelected);
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0,
  );

  const handleToggleAll = () => {
    allItems.forEach((item) =>
      updateCartItem({
        combinationId: item.combinationId,
        payload: { isSelected: !allSelected },
      }),
    );
  };

  const handleToggleShop = (shopId: string) => {
    const group = shopGroups.find((g) => g.shopId === shopId);
    if (!group) return;
    const shopAllSelected = group.items.every((item) => item.isSelected);
    group.items.forEach((item) =>
      updateCartItem({
        combinationId: item.combinationId,
        payload: { isSelected: !shopAllSelected },
      }),
    );
  };

  const handleToggleSelect = (combinationId: string) => {
    const item = allItems.find((i) => i.combinationId === combinationId);
    if (!item) return;
    updateCartItem({ combinationId, payload: { isSelected: !item.isSelected } });
  };

  const handleQuantityChange = (combinationId: string, quantity: number) => {
    updateCartItem({ combinationId, payload: { quantity } });
  };

  const handleRemove = (combinationId: string) => removeCartItem(combinationId);

  const handleRemoveSelected = () =>
    removeCartItems(selectedItems.map((item) => item.combinationId));

  const handleCheckout = () => navigate('/checkout');

  if (isPending) {
    return (
      <div className='min-h-screen bg-[#F5F5F5]'>
        <CartTopBar />

        <div className='mx-auto max-w-7xl px-4 py-4'>
          <div className='flex h-14 items-center rounded-sm bg-white px-5'>
            <div className='h-4 w-4 animate-pulse rounded bg-slate-200' />
            <div className='ml-4 h-4 w-24 animate-pulse rounded bg-slate-200' />
            <div className='ml-auto flex gap-20'>
              <div className='h-4 w-16 animate-pulse rounded bg-slate-200' />
              <div className='h-4 w-16 animate-pulse rounded bg-slate-200' />
              <div className='h-4 w-16 animate-pulse rounded bg-slate-200' />
            </div>
          </div>
          <div className='mt-3 space-y-3'>
            <div className='overflow-hidden rounded-sm bg-white'>
              <div className='flex h-12 items-center border-b border-slate-100 px-5'>
                <div className='h-4 w-4 animate-pulse rounded bg-slate-200' />
                <div className='ml-3 h-4 w-32 animate-pulse rounded bg-slate-200' />
              </div>
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className='flex min-h-30 items-center border-b border-slate-100 px-5'
                >
                  <div className='h-4 w-4 animate-pulse rounded bg-slate-200' />
                  <div className='ml-4 h-20 w-20 shrink-0 animate-pulse rounded bg-slate-200' />
                  <div className='ml-4 flex-1'>
                    <div className='h-4 w-2/3 animate-pulse rounded bg-slate-200' />
                    <div className='mt-3 h-3 w-1/3 animate-pulse rounded bg-slate-200' />
                  </div>
                  <div className='ml-8 h-4 w-20 animate-pulse rounded bg-slate-200' />
                  <div className='ml-12 h-8 w-24 animate-pulse rounded bg-slate-200' />
                  <div className='ml-12 h-4 w-20 animate-pulse rounded bg-slate-200' />
                  <div className='ml-12 h-4 w-12 animate-pulse rounded bg-slate-200' />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className='bg-[#F5F5F5]'>
        <CartTopBar />
        <div className='mx-auto max-w-7xl px-4 py-10 text-center text-sm text-slate-500'>
          {errorMessage}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='bg-[#F5F5F5]'>
      <CartTopBar />

      <div className='mx-auto max-w-7xl px-4 py-4'>
        {allItems.length === 0 ? (
          <div className='bg-white'>
            <CartEmptyState />
          </div>
        ) : (
          <>
            <CartTableHeader allSelected={allSelected} onToggleAll={handleToggleAll} />

            {shopGroups.map((group) => (
              <ShopCartGroup
                key={group.shopId}
                shopId={group.shopId}
                shopName={group.shopName}
                items={group.items}
                assetMap={assetMap}
                isLoadingAssets={isLoadingAssets}
                onToggleShop={handleToggleShop}
                onToggleSelect={handleToggleSelect}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}

            <CartSummaryBar
              allSelected={allSelected}
              selectedCount={selectedItems.length}
              totalAmount={totalAmount}
              onToggleAll={handleToggleAll}
              onRemoveSelected={handleRemoveSelected}
              onCheckout={handleCheckout}
            />
          </>
        )}

        {/*<div className='mt-8'>*/}
        {/*  <SimilarProducts products={SIMILAR_PRODUCTS} />*/}
        {/*</div>*/}
      </div>

      <Footer />
    </div>
  );
}
