import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useShopStore } from '@/stores';
import { axiosPrivate } from '@/utils';

type GetShopInformationResponse = {
  email: string;
  pickupAddressSnapshot: {
    userId: string;
    fullName: string;
    phone: string;
    province: string;
    ward: string;
    addressDetail: string;
    fullAddressText: string;
    latitude: number | null;
    longitude: number | null;
    addressType: string;
  };
};

const useShopInformation = () => {
  const location = useShopStore((s) => s.location);
  const setShop = useShopStore((s) => s.setShop);

  const query = useQuery({
    queryKey: ['shop-location'],
    queryFn: async (): Promise<GetShopInformationResponse> => {
      const response = await axiosPrivate.get('/seller/shop/information');
      return response.data;
    },
    enabled: location === null,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setShop(query.data.pickupAddressSnapshot.province);
    }
  }, [query.data, setShop]);

  return query;
};

export default useShopInformation;
