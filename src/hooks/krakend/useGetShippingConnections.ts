import { useQuery } from '@tanstack/react-query';
import { axiosPrivate } from '@/utils';

export type ShippingConnection = {
  carrierCode: string;
  status: number;
};

export type ShippingCarrier = {
  carrierId: string;
  code: string;
  name: string;
};

export type ShippingConnectionWithCarrier = {
  carrierId: string;
  carrierCode: string;
  carrierName: string;
  status: number;
};

type GetShippingConnectionsResponse = {
  connections?: ShippingConnection[];
  carriers?: ShippingCarrier[];
};

const NOT_CONNECTED_STATUS = 0;

const useGetShippingConnections = (options?: { enabled?: boolean }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ['seller-shipping-connections'],
    queryFn: async (): Promise<ShippingConnectionWithCarrier[]> => {
      const response = await axiosPrivate.get<GetShippingConnectionsResponse>(
        'gateway/seller/shop/shipping-connections',
      );
      const { connections, carriers } = response.data;

      if (!connections || !carriers) {
        throw new Error(
          !connections && !carriers
            ? 'Không thể tải dữ liệu kết nối vận chuyển và đơn vị vận chuyển.'
            : !connections
              ? 'Không thể tải dữ liệu kết nối vận chuyển.'
              : 'Không thể tải dữ liệu đơn vị vận chuyển.',
        );
      }

      const connectionByCode = new Map<string, ShippingConnection>();
      for (const connection of connections) {
        connectionByCode.set(connection.carrierCode, connection);
      }

      return carriers.map((carrier) => {
        const connection = connectionByCode.get(carrier.code);
        return {
          carrierId: carrier.carrierId,
          carrierCode: carrier.code,
          carrierName: carrier.name,
          status: connection?.status ?? NOT_CONNECTED_STATUS,
        };
      });
    },
    enabled: options?.enabled ?? true,
  });

  const errorMessage = error
    ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ??
      (error as Error)?.message ??
      'Có lỗi xảy ra. Vui lòng thử lại.')
    : null;

  return { data, isPending, errorMessage };
};

export default useGetShippingConnections;
