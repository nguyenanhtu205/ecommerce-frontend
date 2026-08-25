import { create } from 'zustand';

type ShopState = {
  location: string | null;
  setShop: (location: string) => void;
  clearShop: () => void;
};

export const useShopStore = create<ShopState>((set) => ({
  location: null,
  setShop: (location) => set({ location }),
  clearShop: () => set({ location: null }),
}));
