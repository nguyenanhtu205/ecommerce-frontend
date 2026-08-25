import { useState } from 'react';
import {
  AuthHeader,
  AuthStepper,
  EmailStep,
  OtpStep,
  PasswordStep,
  SellerOnboardingGuide,
  Footer,
} from '@/components';

type SellerRegisterStep = 'email' | 'otp' | 'password' | 'onboarding';

export default function SellerRegister() {
  const [step, setStep] = useState<SellerRegisterStep>('email');
  const [email, setEmail] = useState('');

  const isEmailStep = step === 'email';

  return (
    <div className='flex min-h-screen flex-col'>
      <AuthHeader title='Đăng ký người bán' />

      <div
        className={`flex flex-1 justify-center px-6 pt-10 pb-16 transition-colors ${
          isEmailStep ? 'bg-linear-to-br from-[#EE4D2D] to-[#f9762d]' : 'bg-white'
        }`}
      >
        <div className={step === 'onboarding' ? 'w-full' : 'w-full max-w-md'}>
          {step !== 'email' && (
            <AuthStepper currentPhase={step === 'otp' ? 1 : step === 'password' ? 2 : 3} />
          )}

          {step === 'email' && (
            <EmailStep
              isSeller={true}
              onNext={(value) => {
                setEmail(value);
                setStep('otp');
              }}
            />
          )}

          {step === 'otp' && (
            <OtpStep
              email={email}
              onVerified={() => setStep('password')}
              onBack={() => setStep('email')}
            />
          )}

          {step === 'password' && (
            <PasswordStep
              email={email}
              onSubmit={() => setStep('onboarding')}
              onBack={() => setStep('otp')}
            />
          )}

          {step === 'onboarding' && <SellerOnboardingGuide shopEmail={email} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
