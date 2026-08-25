export type OrderStatus =
  'pending_payment' | 'shipping' | 'completed' | 'cancelled' | 'return_refund';

export type OrderShop = {
  id: string;
  name: string;
  avatarText: string;
  isFavorite?: boolean;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  thumbnail: string;
  variation: string;
  quantity: number;
  price: number;
  originalPrice?: number;
};

export type Order = {
  id: string;
  shop: OrderShop;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  note?: string;
  merchandiseSubtotal: number;
  shippingFee: number;
  totalDiscount: number;
  xuDiscount: number;
};

export type OrderTabKey =
  'all' | 'pending_payment' | 'shipping' | 'completed' | 'cancelled' | 'return_refund';
