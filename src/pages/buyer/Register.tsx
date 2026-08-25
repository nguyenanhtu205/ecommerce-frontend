import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthHeader,
  AuthStepper,
  EmailStep,
  OtpStep,
  PasswordStep,
  SuccessStep,
  Footer,
} from '@/components';

type RegisterStep = 'email' | 'otp' | 'password' | 'success';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RegisterStep>('email');
  const [email, setEmail] = useState('');

  const isEmailStep = step === 'email';
  const handleGoHome = () => navigate('/');

  return (
    <div className='flex min-h-screen flex-col'>
      <AuthHeader />

      <div
        className={`flex flex-1 justify-center px-6 pt-30 pb-34 transition-colors ${
          isEmailStep ? 'bg-linear-to-br from-[#EE4D2D] to-[#f9762d]' : 'bg-white'
        }`}
      >
        <div className='w-full max-w-md'>
          {!isEmailStep && (
            <AuthStepper currentPhase={step === 'otp' ? 1 : step === 'password' ? 2 : 3} />
          )}

          {step === 'email' && (
            <EmailStep
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
              onSubmit={() => setStep('success')}
              onBack={() => setStep('otp')}
            />
          )}

          {step === 'success' && <SuccessStep email={email} onGoHome={handleGoHome} />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
