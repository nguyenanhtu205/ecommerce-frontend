import { useMemo, useState } from 'react';
import {
  SellerTopbar,
  SellerBreadcrumb,
  SuggestionPanel,
  ProductFormTabs,
  BasicInfoTab,
  SalesInfoTab,
  ShippingTab,
  OtherInfoTab,
} from '@/components';
import type { ProductFormData, ProductFormTabKey, ProductCondition } from '@/types';
import { useCreateProduct } from '@/hooks';
import { useShopStore } from '@/stores';

const CONDITION_TO_NUMBER: Record<ProductCondition, number> = {
  new: 0,
  used: 1,
};

const DEFAULT_VARIANT_GROUP_NAME = 'Phân loại';
const DEFAULT_VARIANT_OPTION_VALUE = 'Mặc định';
const DEFAULT_SKU = 'Mặc định';
const INITIAL_PRODUCT_FORM_DATA = {
  images: [],
  thumbnail: null,
  video: null,
  name: '',
  categoryId: null,
  categoryLabel: '',
  description: '',
  attributes: [],
  variantGroups: [],
  combinations: [],
  quantityDiscounts: [],
  sizeChartUrl: null,
  basePrice: null,
  baseStock: 0,
  weightGrams: null,
  packageDimensions: null,
  isPreOrder: false,
  preOrderDays: null,
  condition: 'new',
  sku: '',
  tags: [],
};

export default function AddProduct() {
  const [activeTab, setActiveTab] = useState<ProductFormTabKey>('basic');
  const [formData, setFormData] = useState<ProductFormData>(
    INITIAL_PRODUCT_FORM_DATA as ProductFormData,
  );

  const location = useShopStore((state) => state.location);

  const { createProduct, isPending, errorMessage } = useCreateProduct();

  const handleFormChange = (patch: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const hasVariants = formData.variantGroups.length > 0;

  const isFormValid = useMemo(() => {
    const hasImage = formData.images.length > 0;
    const hasThumbnail = formData.thumbnail !== null;
    const hasName = formData.name.trim().length > 0;
    const hasCategory = formData.categoryId !== null && formData.categoryLabel !== null;
    const hasDescription = formData.description.trim().length > 0;

    const hasAttributes =
      formData.attributes.length > 0 && formData.attributes.every((a) => a.value.trim().length > 0);

    const hasValidVariantGroups =
      !hasVariants ||
      formData.variantGroups.every(
        (g) =>
          g.name.trim().length > 0 &&
          g.options.length > 0 &&
          g.options.every((o) => o.value.trim().length > 0),
      );

    const hasValidCombinations =
      hasVariants &&
      formData.combinations.length > 0 &&
      formData.combinations.every(
        (c) =>
          c.optionValues.every((v) => v.trim().length > 0) &&
          c.price !== null &&
          c.price > 0 &&
          c.stock > 0 &&
          c.sku.trim().length > 0,
      );

    const hasValidBasePricing =
      !hasVariants &&
      formData.basePrice !== null &&
      formData.basePrice > 0 &&
      formData.baseStock > 0;

    const hasPricing = hasVariants ? hasValidCombinations : hasValidBasePricing;

    const hasWeight = formData.weightGrams !== null && formData.weightGrams > 0;
    const hasPackageDimensions =
      formData.packageDimensions !== null &&
      formData.packageDimensions.length > 0 &&
      formData.packageDimensions.width > 0 &&
      formData.packageDimensions.height > 0;

    const hasCondition = formData.condition === 'new' || formData.condition === 'used';
    const hasTags = formData.tags.length > 0;
    const hasPreOrder =
      !formData.isPreOrder || (formData.preOrderDays !== null && formData.preOrderDays > 0);

    return (
      hasImage &&
      hasThumbnail &&
      hasName &&
      hasCategory &&
      hasDescription &&
      hasAttributes &&
      hasValidVariantGroups &&
      hasPricing &&
      hasWeight &&
      hasPackageDimensions &&
      hasCondition &&
      hasTags &&
      hasPreOrder
    );
  }, [formData, hasVariants]);

  const buildBasicMediaAttachments = (data: ProductFormData) => {
    const attachments: { mediaAssetId: string; role: string; position: number }[] = [];

    if (data.thumbnail) {
      attachments.push({ mediaAssetId: data.thumbnail.assetId, role: 'thumbnail', position: 0 });
    }
    if (data.video) {
      attachments.push({ mediaAssetId: data.video.assetId, role: 'video', position: 0 });
    }
    data.images.forEach((img, idx) => {
      attachments.push({ mediaAssetId: img.assetId, role: 'gallery', position: idx + 1 });
    });

    return attachments;
  };

  const buildVariantMediaAttachments = (data: ProductFormData) =>
    data.variantGroups.flatMap((g) =>
      g.options
        .filter((o) => o.media !== null)
        .map((o) => ({
          mediaAssetId: o.media!.assetId,
          role: 'variant',
          position: 0,
        })),
    );

  const buildSpecifications = (data: ProductFormData) =>
    data.attributes
      .filter((a) => a.value.trim().length > 0)
      .map((a) => ({
        attributeId: a.attributeId,
        title: a.name,
        value: a.value,
      }));

  const buildVariantGroups = (data: ProductFormData) => {
    if (data.variantGroups.length > 0) {
      return data.variantGroups.map((g) => ({
        name: g.name,
        options: g.options.map((o) => ({
          value: o.value,
          mediaId: o.media?.assetId ?? null,
        })),
      }));
    }

    return [
      {
        name: DEFAULT_VARIANT_GROUP_NAME,
        options: [{ value: DEFAULT_VARIANT_OPTION_VALUE, mediaId: null }],
      },
    ];
  };

  const buildVariantCombinations = (data: ProductFormData) => {
    if (data.variantGroups.length > 0) {
      return data.combinations.map((c) => ({
        combinationId: null,
        optionValues: c.optionValues,
        sku: c.sku,
        initialPrice: c.price ?? 0,
        initialStock: c.stock,
      }));
    }

    return [
      {
        combinationId: null,
        optionValues: [DEFAULT_VARIANT_OPTION_VALUE],
        sku: DEFAULT_SKU,
        initialPrice: data.basePrice ?? 0,
        initialStock: data.baseStock,
      },
    ];
  };

  const handleSubmit = () => {
    if (!isFormValid || isPending) return;

    if (!location) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }

    createProduct({
      categoryId: formData.categoryId!,
      name: formData.name,
      description: formData.description,
      tags: formData.tags,
      condition: CONDITION_TO_NUMBER[formData.condition],

      mediaAttachments: [
        ...buildBasicMediaAttachments(formData),
        ...buildVariantMediaAttachments(formData),
      ],

      thumbnailMediaId: formData.thumbnail!.assetId,
      location,
      videoMediaId: formData.video?.assetId ?? null,
      galleryMediaIds: formData.images.map((i) => i.assetId),

      specifications: buildSpecifications(formData),

      variantGroups: buildVariantGroups(formData),
      variantCombinations: buildVariantCombinations(formData),

      shippingInfo: {
        weightGrams: formData.weightGrams!,
        length: formData.packageDimensions!.length,
        width: formData.packageDimensions!.width,
        height: formData.packageDimensions!.height,
      },

      isPreOrder: formData.isPreOrder,
      preOrderDays: formData.isPreOrder ? formData.preOrderDays : null,
    });
  };

  return (
    <div className='flex h-screen flex-col bg-[#F5F5F5]'>
      <SellerTopbar />
      <SellerBreadcrumb
        items={[
          { label: 'Trang Chủ', path: '/seller' },
          { label: 'Sản Phẩm', path: '/seller/products/all' },
          { label: 'Thêm 1 Sản Phẩm Mới' },
        ]}
      />

      <div className='flex flex-1 overflow-hidden'>
        <SuggestionPanel formData={formData} />

        <div className='flex-1 overflow-y-auto'>
          <ProductFormTabs activeTab={activeTab} onChange={setActiveTab} />

          <div className='p-6'>
            {activeTab === 'basic' && (
              <BasicInfoTab formData={formData} onChange={handleFormChange} />
            )}
            {activeTab === 'sales' && (
              <SalesInfoTab formData={formData} onChange={handleFormChange} />
            )}
            {activeTab === 'shipping' && (
              <ShippingTab formData={formData} onChange={handleFormChange} />
            )}
            {activeTab === 'other' && (
              <OtherInfoTab formData={formData} onChange={handleFormChange} />
            )}
          </div>

          {errorMessage && (
            <p className='px-6 pb-2 text-right text-xs text-red-500'>{errorMessage}</p>
          )}

          <div className='flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4'>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isPending}
              className={`px-6 py-2 text-sm font-medium text-white transition-colors ${
                isFormValid && !isPending
                  ? 'cursor-pointer bg-[#EE4D2D] hover:bg-[#d8431f]'
                  : 'cursor-not-allowed bg-[#EE4D2D]/50'
              }`}
            >
              {isPending ? 'Đang đăng...' : 'Đăng Sản Phẩm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
