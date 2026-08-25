import type { ProductFormData, ProductCondition } from '@/types';
import FormRow from './FormRow';

type OtherInfoTabProps = {
  formData: ProductFormData;
  onChange: (patch: Partial<ProductFormData>) => void;
};

export default function OtherInfoTab({ formData, onChange }: OtherInfoTabProps) {
  return (
    <div className='bg-white p-6 shadow-sm'>
      <h2 className='mb-5 text-base font-medium text-slate-800'>Thông tin khác</h2>

      <div className='space-y-6'>
        <FormRow label='Hàng Đặt Trước' required>
          <div className='flex items-center gap-6'>
            {(['no', 'yes'] as const).map((opt) => (
              <label key={opt} className='flex items-center gap-1.5 text-sm text-slate-700'>
                <input
                  type='radio'
                  checked={opt === 'yes' ? formData.isPreOrder : !formData.isPreOrder}
                  onChange={() =>
                    onChange({ isPreOrder: opt === 'yes', preOrderDays: opt === 'yes' ? 2 : null })
                  }
                  className='accent-[#EE4D2D]'
                />
                {opt === 'yes' ? 'Đồng ý' : 'Không'}
              </label>
            ))}
          </div>
          {formData.isPreOrder ? (
            <div className='mt-2 flex items-center gap-2 text-sm text-slate-500'>
              Tôi sẽ gửi hàng trong
              <input
                type='number'
                value={formData.preOrderDays ?? 2}
                onChange={(e) => onChange({ preOrderDays: Number(e.target.value) })}
                className='w-16 border border-slate-300 px-2 py-1 text-center outline-none focus:border-[#EE4D2D]'
              />
              ngày (không bao gồm các ngày nghỉ lễ, Tết và những ngày đơn vị vận chuyển không làm
              việc)
            </div>
          ) : (
            <p className='mt-1.5 text-xs text-slate-400'>
              Tôi sẽ gửi hàng trong 2 ngày (không bao gồm các ngày nghỉ lễ, Tết và những ngày đơn vị
              vận chuyển không làm việc)
            </p>
          )}
        </FormRow>

        <FormRow label='Tình trạng' required>
          <select
            value={formData.condition}
            onChange={(e) => onChange({ condition: e.target.value as ProductCondition })}
            className='w-48 border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#EE4D2D]'
          >
            <option value='new'>Mới</option>
            <option value='used'>Đã qua sử dụng</option>
          </select>
        </FormRow>
      </div>
    </div>
  );
}
