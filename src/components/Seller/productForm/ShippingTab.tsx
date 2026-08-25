import { useState } from 'react';
import type { ProductFormData } from '@/types';
import FormRow from './FormRow';

type ShippingTabProps = {
  formData: ProductFormData;
  onChange: (patch: Partial<ProductFormData>) => void;
};

type DimKey = 'length' | 'width' | 'height';

const INTEGER_REGEX = /^\d+$/;

function validateInteger(raw: string, { allowZero = false } = {}): string | null {
  if (raw.trim() === '') return 'Vui lòng nhập giá trị';
  if (!INTEGER_REGEX.test(raw.trim())) {
    return 'Chỉ được nhập số nguyên (không có dấu chấm, phẩy hoặc số âm)';
  }
  const num = Number(raw);
  if (!allowZero && num <= 0) return 'Giá trị phải lớn hơn 0';
  if (!Number.isSafeInteger(num)) return 'Giá trị quá lớn';
  return null;
}

export default function ShippingTab({ formData, onChange }: ShippingTabProps) {
  const dims = formData.packageDimensions ?? { length: 0, width: 0, height: 0 };

  const [weightRaw, setWeightRaw] = useState(
    formData.weightGrams != null ? String(formData.weightGrams) : '',
  );
  const [weightError, setWeightError] = useState<string | null>(null);

  const [dimsRaw, setDimsRaw] = useState<Record<DimKey, string>>({
    length: dims.length ? String(dims.length) : '',
    width: dims.width ? String(dims.width) : '',
    height: dims.height ? String(dims.height) : '',
  });
  const [dimsError, setDimsError] = useState<Record<DimKey, string | null>>({
    length: null,
    width: null,
    height: null,
  });

  const handleWeightChange = (value: string) => {
    setWeightRaw(value);
    const error = validateInteger(value);
    setWeightError(error);
    if (!error) {
      onChange({ weightGrams: parseInt(value, 10) });
    }
  };

  const handleDimChange = (key: DimKey, value: string) => {
    setDimsRaw((prev) => ({ ...prev, [key]: value }));
    const error = validateInteger(value);
    setDimsError((prev) => ({ ...prev, [key]: error }));
    if (!error) {
      onChange({ packageDimensions: { ...dims, [key]: parseInt(value, 10) } });
    }
  };

  const dimInputClass = (hasError: boolean) =>
    `w-24 border px-3 py-2 text-sm outline-none ${
      hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#EE4D2D]'
    }`;

  return (
    <div className='bg-white p-6 shadow-sm'>
      <h2 className='mb-5 text-base font-medium text-slate-800'>Vận chuyển</h2>

      <div className='space-y-5'>
        <FormRow label='Cân nặng' required>
          <div className='flex items-center gap-2'>
            <input
              type='text'
              inputMode='numeric'
              value={weightRaw}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder='Nhập vào'
              className={`w-40 border px-3 py-2 text-sm outline-none ${
                weightError
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-300 focus:border-[#EE4D2D]'
              }`}
            />
            <span className='text-sm text-slate-400'>gr</span>
          </div>
          <p className='mt-1.5 text-xs text-slate-400'>
            Chỉ nhập số nguyên (không có phần thập phân), ví dụ: 500, không phải 500.5
          </p>
          {weightError && <p className='mt-1 text-xs text-red-500'>{weightError}</p>}
        </FormRow>

        <FormRow label='Kích thước đóng gói' required>
          <div className='flex items-center gap-2'>
            <div className='flex flex-col'>
              <input
                type='text'
                inputMode='numeric'
                value={dimsRaw.length}
                placeholder='Nhập vào'
                onChange={(e) => handleDimChange('length', e.target.value)}
                className={dimInputClass(!!dimsError.length)}
              />
            </div>
            <span className='text-xs text-slate-400'>cm</span>
            <span>×</span>
            <div className='flex flex-col'>
              <input
                type='text'
                inputMode='numeric'
                value={dimsRaw.width}
                placeholder='Nhập vào'
                onChange={(e) => handleDimChange('width', e.target.value)}
                className={dimInputClass(!!dimsError.width)}
              />
            </div>
            <span className='text-xs text-slate-400'>cm</span>
            <span>×</span>
            <div className='flex flex-col'>
              <input
                type='text'
                inputMode='numeric'
                value={dimsRaw.height}
                placeholder='Nhập vào'
                onChange={(e) => handleDimChange('height', e.target.value)}
                className={dimInputClass(!!dimsError.height)}
              />
            </div>
            <span className='text-xs text-slate-400'>cm</span>
          </div>
          <p className='mt-1.5 text-xs text-slate-400'>
            Chỉ nhập số nguyên cho chiều dài, rộng, cao (không có phần thập phân)
          </p>
          <p className='mt-1 text-xs text-slate-400'>
            (Phí vận chuyển thực tế sẽ thay đổi nếu bạn nhập sai kích thước)
          </p>
          {(dimsError.length || dimsError.width || dimsError.height) && (
            <p className='mt-1 text-xs text-red-500'>
              {dimsError.length && `Chiều dài: ${dimsError.length}. `}
              {dimsError.width && `Chiều rộng: ${dimsError.width}. `}
              {dimsError.height && `Chiều cao: ${dimsError.height}.`}
            </p>
          )}
        </FormRow>
      </div>
    </div>
  );
}
