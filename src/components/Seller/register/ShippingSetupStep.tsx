import { useEffect, useState } from 'react';
import CarrierCard from './CarrierCard';
import { useConnectShippingCarrier, useActivateShop, useGetAllCarriers } from '@/hooks';
import type { Address, ShippingCarrier } from '@/types';

type ShippingSetupStepProps = {
  shopId: string;
  email: string;
  pickupAddress: Address | null;
  onBack: () => void;
  onNext: (carriers: ShippingCarrier[]) => void;
};

const CONNECT_STATUS_SUCCESS = 2;
const CONNECT_STATUS_FAILED = 3;

export default function ShippingSetupStep({
  shopId,
  email,
  pickupAddress,
  onBack,
  onNext,
}: ShippingSetupStepProps) {
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [carrierErrors, setCarrierErrors] = useState<Record<string, string>>({});

  const {
    data: allCarriers,
    isPending: isLoadingCarriers,
    errorMessage: carriersErrorMessage,
  } = useGetAllCarriers();

  const { connectShippingCarrier } = useConnectShippingCarrier();
  const { activateShop, isPending: isActivating, errorMessage: activateError } = useActivateShop();


  useEffect(() => {
    if (!allCarriers) return;

    setCarriers(
      allCarriers.map((carrier) => ({
        id: carrier.carrierId,
        code: carrier.code,
        name: carrier.name,
        logoText: carrier.code.toUpperCase(),
        status: 'not_connected',
      })),
    );
  }, [allCarriers]);

  const handleConnect = (carrierId: string) => {
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
          if (data.status === CONNECT_STATUS_SUCCESS) {
            setCarriers((prev) =>
              prev.map((c) =>
                c.id === carrierId
                  ? { ...c, status: 'connected', connectedAt: new Date().toISOString() }
                  : c,
              ),
            );
            return;
          }

          if (data.status === CONNECT_STATUS_FAILED) {
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

  const handleNext = () => {
    if (!hasConnectedCarrier || isActivating) return;

    activateShop(
      { shopId, email },
      {
        onSuccess: () => {
          onNext(carriers);
        },
      },
    );
  };

  const hasConnectedCarrier = carriers.some((c) => c.status === 'connected');

  return (
    <div className='px-10 pb-10'>
      <div className='border-t border-slate-100 pt-6'>
        <h3 className='mb-1 text-sm font-medium text-slate-800'>Địa chỉ lấy hàng</h3>
        <p className='mb-6 text-sm text-slate-500'>
          {pickupAddress ? pickupAddress.fullAddressText : 'Chưa thiết lập địa chỉ lấy hàng'}
        </p>

        <h3 className='mb-3 text-sm font-medium text-slate-800'>Chọn đơn vị vận chuyển</h3>
        <p className='mb-3 text-xs text-[#EE4D2D]'>
          Vui lòng tìm hiểu kỹ về cước phí, thời gian giao hàng và khu vực hỗ trợ của từng đơn vị
          vận chuyển trước khi kết nối.
        </p>

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
      </div>

      {activateError && <p className='mt-4 text-right text-xs text-red-500'>{activateError}</p>}

      <div className='mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6'>
        <button
          type='button'
          onClick={onBack}
          disabled={isActivating}
          className='cursor-pointer border border-slate-300 px-6 py-2 text-sm text-slate-700 hover:bg-slate-50'
        >
          Quay lại
        </button>
        <button
          type='button'
          disabled={!hasConnectedCarrier || isActivating}
          onClick={handleNext}
          className={`px-6 py-2 text-sm font-medium text-white ${
            hasConnectedCarrier && !isActivating
              ? 'cursor-pointer bg-[#EE4D2D] hover:bg-[#d8431f]'
              : 'cursor-not-allowed bg-[#EE4D2D]/50'
          }`}
        >
          {isActivating ? 'Đang xử lý...' : 'Tiếp theo'}
        </button>
      </div>
    </div>
  );
}
