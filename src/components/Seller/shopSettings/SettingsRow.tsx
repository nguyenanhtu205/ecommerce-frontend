import { type ReactNode } from 'react';

type SettingsRowProps = {
  label: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export default function SettingsRow({ label, children, actionLabel, onAction }: SettingsRowProps) {
  return (
    <div className='flex items-center justify-between border-b border-slate-50 py-4 last:border-b-0'>
      <div className='flex items-center gap-10'>
        <span className='w-40 shrink-0 text-sm text-slate-500'>{label}</span>
        <div className='text-sm text-slate-700'>{children}</div>
      </div>
      {actionLabel && (
        <button
          type='button'
          onClick={onAction}
          className='cursor-pointer text-sm text-sky-600 hover:underline'
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
