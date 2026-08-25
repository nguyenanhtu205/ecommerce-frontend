export type User = {
  id: string;
  email: string;
  role: string[];
  hasShop?: boolean;
  shopId?: string;
};
