import { type OrderItem } from './order';

export type ProductProtectionAddon = {
  id: number;
  label: string;
  badge?: string;
  description: string;
  price: number;
  isSelected: boolean;
};

export type CheckoutShippingMethod = {
  carrierCode: string;
  carrierName: string;
  estimatedDeliveryStart: string | null;
  estimatedDeliveryEnd: string | null;
  fee: number;
  isValid: boolean;
  failureReason: string | null;
};

export type CheckoutShopVoucher = {
  code: string | null;
  discountAmount: number;
};

export type CheckoutShopGroup = {
  shopId: string;
  shopName: string;
  isFavorite: boolean;
  items: OrderItem[];
  protectionAddons: ProductProtectionAddon[];
  voucher: CheckoutShopVoucher;
  note: string;
  shippingMethod: CheckoutShippingMethod;
};

export type PaymentMethodType = 'cod' | 'vnpay';

export type PaymentMethod = {
  type: PaymentMethodType;
  label: string;
};

export type ShopeeVoucherSelection = {
  code: string | null;
  discountAmount: number;
};

export type ShopeeXuInfo = {
  availableAmount: number;
  isUsable: boolean;
  isApplied: boolean;
  disabledReason?: string;
};

export type CheckoutSummary = {
  merchandiseSubtotal: number;
  shippingFeeSubtotal: number;
  voucherDiscount: number;
  xuDiscount: number;
  totalPayment: number;
};
