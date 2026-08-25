import { useEffect, useMemo, useState } from 'react';
import { useGetShopVacationSetting, useUpdateShopVacationSetting } from '@/hooks';

export default function VacationModeSection() {
  const { data, isPending: isGetting, errorMessage: getErrorMessage } = useGetShopVacationSetting();

  const {
    updateShopVacationSetting,
    isPending: isUpdating,
    errorMessage: updateErrorMessage,
  } = useUpdateShopVacationSetting();

  const [isEnabled, setIsEnabled] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!data) return;

    setIsEnabled(data.isEnabled);
    setStartDate(data.startDate ?? '');
    setEndDate(data.endDate ?? '');
    setMessage(data.message ?? '');
  }, [data]);

  const isDirty = useMemo(() => {
    if (!data) return false;

    return (
      isEnabled !== data.isEnabled ||
      startDate !== (data.startDate ?? '') ||
      endDate !== (data.endDate ?? '') ||
      message !== (data.message ?? '')
    );
  }, [data, isEnabled, startDate, endDate, message]);

  const handleSave = () => {
    if (!data || !isDirty || isUpdating) return;

    updateShopVacationSetting({
      isEnabled,
      startDate: startDate || null,
      endDate: endDate || null,
      message: message.trim() || null,
    });
  };

  if (isGetting) {
    return (
      <div className='bg-white p-6 shadow-sm'>
        <div className='mb-5 flex items-center justify-between'>
          <div className='w-full'>
            <div className='h-5 w-36 animate-pulse rounded bg-slate-200' />
            <div className='mt-2 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200' />
            <div className='mt-1 h-4 w-3/4 max-w-xl animate-pulse rounded bg-slate-200' />
          </div>

          <div className='ml-6 h-5 w-9 shrink-0 animate-pulse rounded-full bg-slate-200' />
        </div>

        <div className='space-y-4'>
          <div className='flex items-center gap-6'>
            <div>
              <div className='mb-1.5 h-4 w-24 animate-pulse rounded bg-slate-200' />
              <div className='h-10 w-40 animate-pulse rounded bg-slate-200' />
            </div>

            <div>
              <div className='mb-1.5 h-4 w-28 animate-pulse rounded bg-slate-200' />
              <div className='h-10 w-40 animate-pulse rounded bg-slate-200' />
            </div>
          </div>

          <div>
            <div className='mb-1.5 h-4 w-40 animate-pulse rounded bg-slate-200' />
            <div className='h-20 w-full max-w-lg animate-pulse rounded bg-slate-200' />
          </div>
        </div>
      </div>
    );
  }

  if (getErrorMessage) {
    return (
      <div className='bg-white p-6 shadow-sm'>
        <p className='text-sm text-red-500'>{getErrorMessage}</p>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 shadow-sm'>
      <div className='mb-5 flex items-center justify-between'>
        <div>
          <h2 className='text-base font-medium text-slate-800'>Chế Độ Tạm Nghỉ</h2>

          <p className='mt-1 text-sm text-slate-400'>
            Khi bật, Shop sẽ tạm không nhận đơn hàng mới trong khoảng thời gian đã chọn
          </p>
        </div>

        <button
          type='button'
          role='switch'
          aria-checked={isEnabled}
          disabled={isUpdating}
          onClick={() => setIsEnabled((v) => !v)}
          className={`h-5 w-9 shrink-0 rounded-full transition ${
            isUpdating ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          } ${isEnabled ? 'bg-[#EE4D2D]' : 'bg-slate-300'}`}
        >
          <span
            className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              isEnabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div
        className={`space-y-4 transition-opacity ${
          isEnabled ? '' : 'pointer-events-none opacity-50'
        }`}
      >
        <div className='flex items-center gap-6'>
          <div>
            <label className='mb-1.5 block text-sm text-slate-600'>Ngày bắt đầu</label>

            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!isEnabled || isUpdating}
              className='border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D] disabled:cursor-not-allowed'
            />
          </div>

          <div>
            <label className='mb-1.5 block text-sm text-slate-600'>Ngày kết thúc</label>

            <input
              type='date'
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!isEnabled || isUpdating}
              className='border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D] disabled:cursor-not-allowed'
            />
          </div>
        </div>

        <div>
          <label className='mb-1.5 block text-sm text-slate-600'>Lời nhắn tới khách hàng</label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isEnabled || isUpdating}
            rows={3}
            className='w-full max-w-lg resize-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D] disabled:cursor-not-allowed'
          />
        </div>
      </div>

      {updateErrorMessage && <p className='mt-4 text-sm text-red-500'>{updateErrorMessage}</p>}

      <div className='mt-5 flex justify-end'>
        <button
          type='button'
          onClick={handleSave}
          disabled={!isDirty || isUpdating}
          className='cursor-pointer bg-[#EE4D2D] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#d8431f] disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isUpdating ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </div>
  );
}
