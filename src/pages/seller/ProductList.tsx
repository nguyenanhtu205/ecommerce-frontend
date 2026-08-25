import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SellerBreadcrumb } from '@/components';
import { useGetProductStock, useGetMultipleAssets } from '@/hooks';

type ProductTab = 'all' | 'active' | 'out_of_stock';

const TABS: { key: ProductTab; label: string }[] = [
  { key: 'all', label: 'Tất Cả' },
  { key: 'active', label: 'Đang Bán' },
  { key: 'out_of_stock', label: 'Hết Hàng' },
  // TODO: { key: 'violation', label: 'Vi Phạm' },
  // TODO: { key: 'hidden', label: 'Đã Ẩn' },
];

const PAGE_SIZE = 10;

type Product = NonNullable<ReturnType<typeof useGetProductStock>['data']>[number];

type EditedFields = {
  name: string;
  description: string;
  specifications: Record<string, string>;
  tags: string[];
  shipping: {
    weightGrams: number;
    length: number;
    width: number;
    height: number;
  };
};

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫';
}

function ProductCardSkeleton() {
  return (
    <div className='flex items-center gap-3 p-4'>
      <div className='h-14 w-14 animate-pulse bg-slate-200' />
      <div className='flex-1 space-y-2'>
        <div className='h-4 w-2/3 animate-pulse bg-slate-200' />
        <div className='h-3 w-1/4 animate-pulse bg-slate-200' />
      </div>
    </div>
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProductTab>('all');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editedStocks, setEditedStocks] = useState<
    Record<string, Record<string, { price: number; stock: number }>>
  >({});
  const [editedFields, setEditedFields] = useState<Record<string, EditedFields>>({});
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  const { data: products, isPending, errorMessage } = useGetProductStock();

  // TODO: BE chưa có field "status" phân biệt Đang Bán / Vi Phạm / Đã Ẩn rõ ràng,
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeTab === 'out_of_stock') return products.filter((p) => p.totalStock === 0);
    if (activeTab === 'active') return products.filter((p) => p.totalStock > 0);
    return products;
  }, [products, activeTab]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page],
  );

  const thumbnailIds = useMemo(
    () => Array.from(new Set(pageProducts.map((p) => p.thumbnailMediaId).filter(Boolean))),
    [pageProducts],
  );
  const { data: thumbnailAssets, isPending: isThumbnailsPending } = useGetMultipleAssets({
    assetIds: thumbnailIds,
  });
  const thumbnailUrlById = useMemo(() => {
    const map = new Map<string, string>();
    thumbnailAssets?.items.forEach((item) => {
      if (item.found) map.set(item.id, item.asset.publicUrl);
    });
    return map;
  }, [thumbnailAssets]);

  const expandedProduct = pageProducts.find((p) => p.id === expandedId) ?? null;

  const detailAssetIds = useMemo(() => {
    if (!expandedProduct) return [];
    return Array.from(
      new Set(
        [...expandedProduct.galleryMediaIds, expandedProduct.videoMediaId].filter(
          (id): id is string => !!id,
        ),
      ),
    );
  }, [expandedProduct]);
  const { data: detailAssets, isPending: isDetailAssetsPending } = useGetMultipleAssets(
    { assetIds: detailAssetIds },
    { enabled: !!expandedId && detailAssetIds.length > 0 },
  );
  const detailUrlById = useMemo(() => {
    const map = new Map<string, string>();
    detailAssets?.items.forEach((item) => {
      if (item.found) map.set(item.id, item.asset.publicUrl);
    });
    return map;
  }, [detailAssets]);

  function getVariantRows(product: Product) {
    if (product.variantCombinations.length > 0) {
      return product.variantCombinations.map((combo) => ({
        id: combo.combinationId,
        sku: combo.sku,
        label: combo.optionValues.join(' - '),
      }));
    }
    return product.stocks.map((s) => ({ id: s.id, sku: undefined, label: 'Mặc định' }));
  }

  function toggleExpand(product: Product) {
    if (expandedId === product.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(product.id);

    if (!editedStocks[product.id]) {
      const rows = getVariantRows(product);
      const init: Record<string, { price: number; stock: number }> = {};
      rows.forEach((row) => {
        const stock = product.stocks.find((s) => s.id === row.id);
        init[row.id] = { price: stock?.price ?? 0, stock: stock?.stock ?? 0 };
      });
      setEditedStocks((prev) => ({ ...prev, [product.id]: init }));
    }

    if (!editedFields[product.id]) {
      const specInit: Record<string, string> = {};
      product.specifications.forEach((spec) => {
        specInit[spec.attributeId] = spec.value;
      });
      setEditedFields((prev) => ({
        ...prev,
        [product.id]: {
          name: product.name,
          description: product.description ?? '',
          specifications: specInit,
          tags: [...product.tags],
          shipping: {
            weightGrams: product.shippingInfo.weightGrams,
            length: product.shippingInfo.dimensions.length,
            width: product.shippingInfo.dimensions.width,
            height: product.shippingInfo.dimensions.height,
          },
        },
      }));
    }
  }

  function handleShippingChange(
    productId: string,
    field: keyof EditedFields['shipping'],
    value: number,
  ) {
    setEditedFields((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        shipping: { ...prev[productId].shipping, [field]: value },
      },
    }));
  }

  function handleFieldChange(
    productId: string,
    rowId: string,
    field: 'price' | 'stock',
    value: number,
  ) {
    setEditedStocks((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [rowId]: { ...prev[productId][rowId], [field]: value },
      },
    }));
  }

  function updateEditedFields(productId: string, patch: Partial<EditedFields>) {
    setEditedFields((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...patch },
    }));
  }

  function handleNameChange(productId: string, value: string) {
    updateEditedFields(productId, { name: value });
  }

  function handleDescriptionChange(productId: string, value: string) {
    updateEditedFields(productId, { description: value });
  }

  function handleSpecValueChange(productId: string, attributeId: string, value: string) {
    setEditedFields((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        specifications: { ...prev[productId].specifications, [attributeId]: value },
      },
    }));
  }

  function handleTagInputChange(productId: string, value: string) {
    setTagInputs((prev) => ({ ...prev, [productId]: value }));
  }

  function handleTagInputKeyDown(productId: string, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = (tagInputs[productId] ?? '').trim();
    if (!value) return;

    setEditedFields((prev) => {
      const current = prev[productId];
      if (!current || current.tags.includes(value)) return prev;
      return {
        ...prev,
        [productId]: { ...current, tags: [...current.tags, value] },
      };
    });
    setTagInputs((prev) => ({ ...prev, [productId]: '' }));
  }

  function removeTag(productId: string, tag: string) {
    setEditedFields((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        tags: prev[productId].tags.filter((t) => t !== tag),
      },
    }));
  }

  function hasChanges(product: Product) {
    const editedStock = editedStocks[product.id];
    const stockChanged = editedStock
      ? product.stocks.some(
          (s) =>
            editedStock[s.id] &&
            (editedStock[s.id].price !== s.price || editedStock[s.id].stock !== s.stock),
        )
      : false;

    const fields = editedFields[product.id];
    if (!fields) return stockChanged;

    const nameChanged = fields.name !== product.name;
    const descriptionChanged = fields.description !== (product.description ?? '');
    const specsChanged = product.specifications.some(
      (spec) => fields.specifications[spec.attributeId] !== spec.value,
    );
    const tagsChanged =
      fields.tags.length !== product.tags.length ||
      fields.tags.some((tag, i) => tag !== product.tags[i]);
    const shippingChanged =
      fields.shipping.weightGrams !== product.shippingInfo.weightGrams ||
      fields.shipping.length !== product.shippingInfo.dimensions.length ||
      fields.shipping.width !== product.shippingInfo.dimensions.width ||
      fields.shipping.height !== product.shippingInfo.dimensions.height;

    return (
      stockChanged ||
      nameChanged ||
      descriptionChanged ||
      specsChanged ||
      tagsChanged ||
      shippingChanged
    );
  }

  function handleSave(product: Product) {
    // TODO: gọi API cập nhật sản phẩm (tên, mô tả, thông số, tags, giá & tồn kho) khi có endpoint tương ứng
    console.log('Lưu thay đổi cho sản phẩm', product.id, {
      stocks: editedStocks[product.id],
      fields: editedFields[product.id],
    });
  }

  const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label;

  return (
    <div>
      <SellerBreadcrumb
        items={[
          { label: 'Trang Chủ', path: '/seller' },
          { label: 'Sản Phẩm', path: '/seller/products/all' },
          { label: activeTabLabel ?? 'Tất Cả' },
        ]}
      />
      <div className='mb-3 flex items-center justify-between bg-white px-6 py-4'>
        <h1 className='text-base font-medium text-slate-800'>Tất Cả Sản Phẩm</h1>
        <button
          onClick={() => navigate('/seller/products/new')}
          className='cursor-pointer bg-[#EE4D2D] px-5 py-2 text-sm font-medium text-white hover:bg-[#d8431f]'
        >
          + Thêm Sản Phẩm Mới
        </button>
      </div>

      <div className='bg-white'>
        <div className='flex gap-6 border-b border-slate-200 px-6'>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer border-b-2 py-3 text-sm ${
                activeTab === tab.key
                  ? 'border-[#EE4D2D] font-medium text-[#EE4D2D]'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {errorMessage && <div className='px-6 py-4 text-sm text-red-500'>{errorMessage}</div>}

        {isPending ? (
          <div className='divide-y divide-slate-50'>
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : pageProducts.length === 0 ? (
          <div className='px-6 py-10 text-center text-sm text-slate-400'>
            Không có sản phẩm nào.
          </div>
        ) : (
          <div className='divide-y divide-slate-50'>
            {pageProducts.map((product) => {
              const isExpanded = expandedId === product.id;
              const thumbnailUrl = thumbnailUrlById.get(product.thumbnailMediaId);
              const fields = editedFields[product.id];

              return (
                <div key={product.id}>
                  <div
                    onClick={() => toggleExpand(product)}
                    className='flex cursor-pointer items-center gap-3 p-4 hover:bg-slate-50'
                    title='Xem chi tiết'
                  >
                    {isThumbnailsPending || !thumbnailUrl ? (
                      <div className='h-14 w-14 animate-pulse bg-slate-200' />
                    ) : (
                      <img src={thumbnailUrl} alt='' className='h-14 w-14 object-cover' />
                    )}
                    <div className='flex-1'>
                      <div className='text-slate-700'>{product.name}</div>
                      <div className='mt-1 text-xs text-slate-400'>
                        Tổng kho: {product.totalStock}
                      </div>
                    </div>
                  </div>

                  {isExpanded && fields && (
                    <div className='space-y-4 bg-slate-50 px-6 py-4 text-sm text-slate-700'>
                      <div>
                        <div className='mb-1 font-medium'>Tên sản phẩm</div>
                        <input
                          type='text'
                          value={fields.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleNameChange(product.id, e.target.value)}
                          className='w-full border border-slate-200 px-2 py-1'
                        />
                      </div>

                      <div>
                        <div className='mb-1 font-medium'>Mô tả</div>
                        <textarea
                          value={fields.description}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleDescriptionChange(product.id, e.target.value)}
                          rows={3}
                          className='w-full border border-slate-200 px-2 py-1 text-slate-600'
                        />
                      </div>

                      <div>
                        <div className='mb-1 font-medium'>Tags</div>
                        <div className='flex flex-wrap items-center gap-2'>
                          {fields.tags.map((tag) => (
                            <span
                              key={tag}
                              className='flex items-center gap-1 bg-slate-200 px-2 py-0.5 text-xs'
                            >
                              {tag}
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTag(product.id, tag);
                                }}
                                className='cursor-pointer text-slate-500 hover:text-slate-800'
                                aria-label={`Xoá tag ${tag}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <input
                            type='text'
                            value={tagInputs[product.id] ?? ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleTagInputChange(product.id, e.target.value)}
                            onKeyDown={(e) => handleTagInputKeyDown(product.id, e)}
                            placeholder='Nhập tag rồi Enter'
                            className='w-40 border border-slate-200 px-2 py-1 text-xs'
                          />
                        </div>
                      </div>

                      {product.specifications.length > 0 && (
                        <div>
                          <div className='mb-1 font-medium'>Thông số kỹ thuật</div>
                          <div className='grid grid-cols-2 gap-2'>
                            {product.specifications.map((spec) => (
                              <div key={spec.attributeId} className='flex items-center gap-2'>
                                <span className='w-1/3 shrink-0 text-slate-400'>{spec.title}</span>
                                <input
                                  type='text'
                                  value={fields.specifications[spec.attributeId] ?? ''}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    handleSpecValueChange(
                                      product.id,
                                      spec.attributeId,
                                      e.target.value,
                                    )
                                  }
                                  className='flex-1 border border-slate-200 px-2 py-1'
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {product.variantGroups.length > 0 && (
                        <div>
                          <div className='mb-1 font-medium'>Nhóm biến thể</div>
                          {product.variantGroups.map((group) => (
                            <div key={group.name} className='text-slate-600'>
                              <span className='text-slate-400'>{group.name}: </span>
                              {group.options.map((o) => o.value).join(', ')}
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <div className='mb-1 font-medium'>Giá & Tồn kho theo phân loại</div>
                        <table className='w-full text-left'>
                          <thead>
                            <tr className='text-xs text-slate-400'>
                              <th className='py-1 font-normal'>Phân loại</th>
                              <th className='py-1 font-normal'>SKU</th>
                              <th className='py-1 font-normal'>Giá</th>
                              <th className='py-1 font-normal'>Tồn kho</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getVariantRows(product).map((row) => {
                              const edited = editedStocks[product.id]?.[row.id];
                              return (
                                <tr key={row.id}>
                                  <td className='py-1'>{row.label}</td>
                                  <td className='py-1 text-slate-500'>{row.sku ?? '-'}</td>
                                  <td className='py-1'>
                                    <input
                                      type='number'
                                      value={edited?.price ?? 0}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          product.id,
                                          row.id,
                                          'price',
                                          Number(e.target.value),
                                        )
                                      }
                                      className='w-28 border border-slate-200 px-2 py-1'
                                    />
                                    <div className='mt-0.5 text-xs text-slate-400'>
                                      {formatPrice(edited?.price ?? 0)}
                                    </div>
                                  </td>
                                  <td className='py-1'>
                                    <input
                                      type='number'
                                      value={edited?.stock ?? 0}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          product.id,
                                          row.id,
                                          'stock',
                                          Number(e.target.value),
                                        )
                                      }
                                      className='w-20 border border-slate-200 px-2 py-1'
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <div className='mb-1 font-medium'>Vận chuyển</div>
                        <div className='grid grid-cols-4 gap-2'>
                          <div>
                            <div className='mb-1 text-xs text-slate-400'>Khối lượng (g)</div>
                            <input
                              type='number'
                              value={fields.shipping.weightGrams}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleShippingChange(
                                  product.id,
                                  'weightGrams',
                                  Number(e.target.value),
                                )
                              }
                              className='w-full border border-slate-200 px-2 py-1'
                            />
                          </div>
                          <div>
                            <div className='mb-1 text-xs text-slate-400'>Dài (cm)</div>
                            <input
                              type='number'
                              value={fields.shipping.length}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleShippingChange(product.id, 'length', Number(e.target.value))
                              }
                              className='w-full border border-slate-200 px-2 py-1'
                            />
                          </div>
                          <div>
                            <div className='mb-1 text-xs text-slate-400'>Rộng (cm)</div>
                            <input
                              type='number'
                              value={fields.shipping.width}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleShippingChange(product.id, 'width', Number(e.target.value))
                              }
                              className='w-full border border-slate-200 px-2 py-1'
                            />
                          </div>
                          <div>
                            <div className='mb-1 text-xs text-slate-400'>Cao (cm)</div>
                            <input
                              type='number'
                              value={fields.shipping.height}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleShippingChange(product.id, 'height', Number(e.target.value))
                              }
                              className='w-full border border-slate-200 px-2 py-1'
                            />
                          </div>
                        </div>
                      </div>

                      {product.galleryMediaIds.length > 0 && (
                        <div>
                          <div className='mb-1 font-medium'>Thư viện ảnh</div>
                          <div className='flex flex-wrap gap-2'>
                            {isDetailAssetsPending
                              ? product.galleryMediaIds.map((id) => (
                                  <div key={id} className='h-20 w-20 animate-pulse bg-slate-200' />
                                ))
                              : product.galleryMediaIds.map((id) => {
                                  const url = detailUrlById.get(id);
                                  return url ? (
                                    <img
                                      key={id}
                                      src={url}
                                      alt=''
                                      className='h-20 w-20 object-cover'
                                    />
                                  ) : (
                                    <div
                                      key={id}
                                      className='h-20 w-20 animate-pulse bg-slate-200'
                                    />
                                  );
                                })}
                          </div>
                        </div>
                      )}

                      {product.videoMediaId && (
                        <div>
                          <div className='mb-1 font-medium'>Video</div>
                          {isDetailAssetsPending || !detailUrlById.get(product.videoMediaId) ? (
                            <div className='h-40 w-72 animate-pulse bg-slate-200' />
                          ) : (
                            <video
                              src={detailUrlById.get(product.videoMediaId)}
                              controls
                              className='h-40 w-72'
                            />
                          )}
                        </div>
                      )}

                      <button
                        disabled={!hasChanges(product)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(product);
                        }}
                        className='cursor-pointer bg-[#EE4D2D] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:bg-slate-300'
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isPending && filteredProducts.length > 0 && (
          <div className='flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-3 text-sm'>
            <span className='text-slate-400'>
              Trang {page}/{totalPages}
            </span>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className='cursor-pointer border border-slate-200 px-3 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Trước
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className='cursor-pointer border border-slate-200 px-3 py-1 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
