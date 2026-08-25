import type { ReactNode } from 'react';

export default function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className='flex items-start gap-6'>
      <span className='w-40 shrink-0 pt-2 text-right text-sm text-slate-700'>
        {required && <span className='mr-0.5 text-red-500'>*</span>}
        {label}
      </span>
      <div className='flex-1'>{children}</div>
    </div>
  );
}
