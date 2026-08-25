import { type ReactNode } from 'react';

type AuthStepperProps = {
  /** 1 = đang xác minh email, 2 = đang tạo mật khẩu, 3 = đã hoàn thành */
  currentPhase: 1 | 2 | 3;
};

const NUMBER_STEPS = [
  { num: 1, label: 'Xác minh email' },
  { num: 2, label: 'Tạo mật khẩu' },
];

function StepNode({
  active,
  children,
  label,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <div className='flex w-16 shrink-0 flex-col items-center gap-1.5'>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          active ? 'bg-[#42B54A] text-white' : 'border border-slate-300 text-slate-400'
        }`}
      >
        {children}
      </span>
      <span
        className={`text-center text-[11px] leading-tight ${
          active ? 'text-[#42B54A]' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return <span className={`mt-3.5 h-px flex-1 ${active ? 'bg-[#42B54A]' : 'bg-slate-200'}`} />;
}

export default function AuthStepper({ currentPhase }: AuthStepperProps) {
  return (
    <div className='mx-auto mb-8 flex max-w-md items-start'>
      {NUMBER_STEPS.map((step, _) => (
        <>
          <StepNode active={currentPhase >= step.num} label={step.label}>
            {step.num}
          </StepNode>
          <Connector active={currentPhase > step.num} />
        </>
      ))}

      <StepNode active={currentPhase >= 3} label='Hoàn thành'>
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
        >
          <path d='m5 13 4 4L19 7' />
        </svg>
      </StepNode>
    </div>
  );
}
