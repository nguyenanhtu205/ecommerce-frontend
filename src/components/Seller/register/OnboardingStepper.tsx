type OnboardingStepperProps = {
  currentStep: number;
};

const STEPS = ['Thông tin Shop', 'Cài đặt vận chuyển', 'Hoàn tất'];

export default function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className='px-10 pt-8 pb-6'>
      <div className='relative flex'>
        {/* Line container */}
        <div className='absolute top-1.25 right-[16.6667%] left-[16.6667%] h-px bg-slate-200'>
          {/* Progress line */}
          <div
            className='h-full bg-[#EE4D2D] transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>

        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <div key={label} className='relative z-10 flex flex-1 flex-col items-center'>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive || isDone ? 'bg-[#EE4D2D]' : 'bg-slate-300'
                }`}
              />

              <span
                className={`mt-2 text-sm ${
                  isActive ? 'font-medium text-slate-800' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
