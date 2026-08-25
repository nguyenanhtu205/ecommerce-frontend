export type ProductCondition = 'new' | 'used';

export type ProductAttributeValue = {
  attributeId: string;
  name: string;
  value: string;
};

type ProductMediaAsset = {
  assetId: string;
  url: string;
};

export type VariantGroupOption = {
  id: string;
  value: string;
  media: ProductMediaAsset | null;
};

export type VariantGroup = {
  id: string;
  name: string;
  options: VariantGroupOption[];
};

export type VariantCombination = {
  key: string;
  optionValues: string[];
  price: number | null;
  stock: number;
  sku: string;
};

export type PackageDimensions = {
  length: number;
  width: number;
  height: number;
};

export interface ProductFormData {
  images: ProductMediaAsset[];
  thumbnail: ProductMediaAsset | null;
  video: ProductMediaAsset | null;
  name: string;
  categoryId: string | null;
  categoryLabel: string | null;
  description: string;
  attributes: ProductAttributeValue[];

  variantGroups: VariantGroup[];
  combinations: VariantCombination[];
  basePrice: number | null;
  baseStock: number;

  weightGrams: number | null;
  packageDimensions: PackageDimensions | null;

  isPreOrder: boolean;
  preOrderDays: number | null;
  condition: ProductCondition;
  tags: string[];
}

export type ProductFormTabKey = 'basic' | 'sales' | 'shipping' | 'other';
