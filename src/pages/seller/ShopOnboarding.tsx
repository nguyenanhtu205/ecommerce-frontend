import { useState } from 'react';
import {
  AuthHeader,
  OnboardingStepper,
  ShopInfoStep,
  ShippingSetupStep,
  OnboardingCompleteStep,
} from '@/components';
import { type Address, type ShopBasicInfo } from '@/types';

type OnboardingStep = 1 | 2 | 3;

export default function ShopOnboarding() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [shopInfo, setShopInfo] = useState<ShopBasicInfo>({
    shopName: '',
    pickupAddressId: null,
    email: '',
    phone: '',
  });
  const [pickupAddress, setPickupAddress] = useState<Address | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);

  return (
    <div className='min-h-screen bg-[#F5F5F5]'>
      <AuthHeader title='Kênh Người Bán' />

      <div className='mx-auto max-w-4xl py-8'>
        <div className='bg-white'>
          <OnboardingStepper currentStep={step} />

          {step === 1 && (
            <ShopInfoStep
              initialInfo={shopInfo}
              onSave={(info, address) => {
                setShopInfo(info);
                setPickupAddress(address);
              }}
              onNext={(info, address, newShopId) => {
                setShopInfo(info);
                setPickupAddress(address);
                setShopId(newShopId);
                setStep(2);
              }}
            />
          )}

          {step === 2 && shopId && (
            <ShippingSetupStep
              shopId={shopId}
              email={shopInfo.email}
              pickupAddress={pickupAddress}
              onBack={() => setStep(1)}
              onNext={() => {
                setStep(3);
              }}
            />
          )}

          {step === 3 && <OnboardingCompleteStep shopName={shopInfo.shopName} />}
        </div>
      </div>
    </div>
  );
}
