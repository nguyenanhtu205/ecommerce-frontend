export type CarrierConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'failed';

export interface ShippingCarrier {
  id: string;
  code: string;
  name: string;
  logoText: string;
  status: CarrierConnectionStatus;
  connectedAt?: string;
}
