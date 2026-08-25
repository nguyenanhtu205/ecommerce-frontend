import { useEffect, useState } from 'react';
import { type ShippingCarrier as ShippingCarrierUI, type Address, type AddressType } from '@/types';
import { CarrierCard, AddressModal } from '@/components';
import {
  useConnectShippingCarrier,
  useGetShippingConnections,
  useGetAddresses,
  useDeleteAddress,
} from '@/hooks';
import { useAuthStore } from '@/stores';
import { Plus } from 'lucide-react';

const CONNECTION_STATUS = {
  NOT_CONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  FAILED: 3,
} as const;

const ADDRESS_TYPE_MAP: Record<number, AddressType> = {
  0: 'home',
  1: 'office',
};

const ADDRESS_TYPE_LABEL: Record<AddressType, string> = {
  home: 'Nhà Riêng',
  office: 'Văn Phòng',
};

function mapStatusToUiStatus(status: number): ShippingCarrierUI['status'] {
  switch (status) {
    case CONNECTION_STATUS.CONNECTED:
      return 'connected';
    case CONNECTION_STATUS.CONNECTING:
      return 'connecting';
    case CONNECTION_STATUS.FAILED:
      return 'failed';
    default:
      return 'not_connected';
  }
}

export default function ShippingSettingsSection() {
  const shopId = useAuthStore((state) => state.user?.shopId);

  const [carriers, setCarriers] = useState<ShippingCarrierUI[]>([]);
  const [carrierErrors, setCarrierErrors] = useState<Record<string, string>>({});

  const {
    data: shippingConnections,
    isPending: isLoadingCarriers,
    errorMessage: carriersErrorMessage,
  } = useGetShippingConnections();

  const { connectShippingCarrier } = useConnectShippingCarrier();

  const {
    data: addressesData,
    isPending: isLoadingAddresses,
    errorMessage: addressesErrorMessage,
  } = useGetAddresses();

  const {
    deleteAddress,
    isPending: isDeleting,
    errorMessage: deleteErrorMessage,
  } = useDeleteAddress();

  const [editingAddress, setEditingAddress] = useState<Address | null | undefined>(undefined);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  const pickupAddresses: Address[] = (addressesData ?? [])
    .filter((item) => item.isPickupAddress)
    .map((item) => ({
      id: item.id,
      fullName: item.fullName,
      phone: item.phone,
      province: item.province,
      ward: item.ward,
      addressDetail: item.addressDetail,
      fullAddressText: item.fullAddressText,
      addressType: ADDRESS_TYPE_MAP[item.addressType] ?? 'home',
      isDefault: item.isDefault,
      isPickupAddress: item.isPickupAddress,
      latitude: item.latitude ?? undefined,
      longitude: item.longitude ?? undefined,
    }));

  const canAddAddress = !isLoadingAddresses && !addressesErrorMessage;
  const isDefault = canAddAddress && pickupAddresses.length === 0;

  useEffect(() => {
    if (!shippingConnections) return;

    setCarriers(
      shippingConnections.map((connection) => ({
        id: connection.carrierId,
        code: connection.carrierCode,
        name: connection.carrierName,
        logoText: connection.carrierCode.toUpperCase(),
        status: mapStatusToUiStatus(connection.status),
      })),
    );
  }, [shippingConnections]);

  const handleConnect = (carrierId: string) => {
    if (!shopId) return;

    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, status: 'connecting' } : c)),
    );
    setCarrierErrors((prev) => {
      const { [carrierId]: _removed, ...rest } = prev;
      return rest;
    });

    connectShippingCarrier(
      { shopId, carrierId },
      {
        onSuccess: (data) => {
          if (data.status === CONNECTION_STATUS.CONNECTED) {
            setCarriers((prev) =>
              prev.map((c) =>
                c.id === carrierId
                  ? { ...c, status: 'connected', connectedAt: new Date().toISOString() }
                  : c,
              ),
            );
            return;
          }

          if (data.status === CONNECTION_STATUS.FAILED) {
            setCarriers((prev) =>
              prev.map((c) => (c.id === carrierId ? { ...c, status: 'failed' } : c)),
            );
            setCarrierErrors((prev) => ({
              ...prev,
              [carrierId]: 'Kết nối thất bại. Vui lòng thử lại.',
            }));
          }
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
            'Có lỗi xảy ra. Vui lòng thử lại.';

          setCarriers((prev) =>
            prev.map((c) => (c.id === carrierId ? { ...c, status: 'failed' } : c)),
          );
          setCarrierErrors((prev) => ({ ...prev, [carrierId]: message }));
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingAddress) return;
    deleteAddress(deletingAddress.id, {
      onSuccess: () => {
        setDeletingAddress(null);
      },
    });
  };

  return (
    <div className='bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-base font-medium text-slate-800'>Địa Chỉ Lấy Hàng</h2>
        <button
          onClick={() => setEditingAddress(null)}
          disabled={!canAddAddress}
          className='flex cursor-pointer items-center gap-2 bg-[#EE4D2D] px-3 py-2 text-xs text-white hover:bg-[#e24929] disabled:cursor-not-allowed disabled:opacity-50'
        >
          <Plus size={12} />
          Thêm địa chỉ
        </button>
      </div>

      <div className='mb-6 space-y-3 border-b border-slate-50 pb-6'>
        {isLoadingAddresses ? (
          <div className='divide-y divide-slate-100'>
            {[1, 2].map((i) => (
              <div key={i} className='flex items-center justify-between py-3'>
                <div className='h-3.5 w-64 animate-pulse rounded bg-slate-200' />
                <div className='flex gap-3'>
                  <div className='h-3.5 w-8 animate-pulse rounded bg-slate-200' />
                  <div className='h-3.5 w-8 animate-pulse rounded bg-slate-200' />
                </div>
              </div>
            ))}
          </div>
        ) : addressesErrorMessage ? (
          <p className='text-sm text-red-500'>{addressesErrorMessage}</p>
        ) : pickupAddresses.length === 0 ? (
          <div className='flex items-center justify-between'>
            <span className='text-sm text-slate-400'>Chưa có địa chỉ lấy hàng</span>
            <button
              type='button'
              onClick={() => setEditingAddress(null)}
              className='cursor-pointer text-sm text-sky-600 hover:underline'
            >
              Thêm
            </button>
          </div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {pickupAddresses.map((address) => (
              <div key={address.id} className='flex items-center justify-between py-3 first:pt-0'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-slate-700'>{address.fullAddressText}</span>
                  <span className='border border-slate-300 px-1.5 py-0.5 text-xs text-slate-500'>
                    {ADDRESS_TYPE_LABEL[address.addressType]}
                  </span>
                  <span className='text-sm text-slate-400'>|</span>
                  <span className='text-sm text-slate-500'>{address.fullName}</span>
                  <span className='text-sm text-slate-400'>|</span>
                  <span className='text-sm text-slate-500'>{address.phone}</span>
                </div>
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => setEditingAddress(address)}
                    className='cursor-pointer text-sm text-sky-600 hover:underline'
                  >
                    Sửa
                  </button>
                  <button
                    type='button'
                    onClick={() => setDeletingAddress(address)}
                    className='cursor-pointer text-sm text-red-500 hover:underline'
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className='mb-4 text-base font-medium text-slate-800'>Đơn Vị Vận Chuyển</h2>

      {isLoadingCarriers ? (
        <div className='space-y-3'>
          {[1, 2].map((i) => (
            <div
              key={i}
              className='flex items-center justify-between border border-slate-200 px-5 py-4'
            >
              <div className='flex items-center gap-4'>
                <div className='h-11 w-11 animate-pulse bg-slate-200' />
                <div className='space-y-2'>
                  <div className='h-3.5 w-32 animate-pulse rounded bg-slate-200' />
                  <div className='h-3 w-20 animate-pulse rounded bg-slate-200' />
                </div>
              </div>
              <div className='h-8 w-20 animate-pulse rounded bg-slate-200' />
            </div>
          ))}
        </div>
      ) : carriersErrorMessage ? (
        <p className='text-sm text-red-500'>{carriersErrorMessage}</p>
      ) : (
        <div className='space-y-3'>
          {carriers.map((carrier) => (
            <div key={carrier.id}>
              <CarrierCard carrier={carrier} onConnect={handleConnect} />
              {carrierErrors[carrier.id] && (
                <p className='mt-1 text-xs text-red-500'>{carrierErrors[carrier.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <AddressModal
        open={editingAddress !== undefined}
        initialAddress={editingAddress}
        onClose={() => setEditingAddress(undefined)}
        onSave={() => setEditingAddress(undefined)}
        isDefault={isDefault}
        isPickUpAddress={true}
      />

      {deletingAddress && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
          onClick={() => !isDeleting && setDeletingAddress(null)}
        >
          <div className='w-full max-w-sm bg-white shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className='px-6 py-5'>
              <h3 className='text-base font-medium text-slate-800'>Xoá địa chỉ</h3>
              <p className='mt-3 text-sm text-slate-600'>Bạn có chắc chắn muốn xoá địa chỉ này?</p>
              {deleteErrorMessage && (
                <p className='mt-2 text-xs text-red-500'>{deleteErrorMessage}</p>
              )}
            </div>
            <div className='flex justify-end gap-3 border-t border-slate-100 px-6 py-4'>
              <button
                type='button'
                onClick={() => setDeletingAddress(null)}
                disabled={isDeleting}
                className='h-10 cursor-pointer px-6 text-sm text-slate-600 hover:bg-gray-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
              >
                Huỷ
              </button>
              <button
                type='button'
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className='h-10 cursor-pointer bg-[#EE4D2D] px-8 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-[#EE4D2D]/40'
              >
                {isDeleting ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
