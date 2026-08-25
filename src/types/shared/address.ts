export type AddressType = 'home' | 'office';

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  addressDetail: string;
  fullAddressText: string;
  addressType: AddressType;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  isPickupAddress?: boolean;
};
