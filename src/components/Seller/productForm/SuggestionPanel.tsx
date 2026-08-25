import { type ProductFormData } from '@/types';

type SuggestionItem = {
  id: number;
  label: string;
  isDone: boolean;
};

type SuggestionPanelProps = {
  formData: ProductFormData;
};

function computeSuggestions(data: ProductFormData): SuggestionItem[] {
  return [
    { id: 1, label: 'Thêm ít nhất 3 hình ảnh', isDone: data.images.length >= 3 },
    { id: 2, label: 'Thêm video sản phẩm', isDone: !!data.video },
    {
      id: 3,
      label: 'Tên sản phẩm có ít nhất 25 ký tự',
      isDone: data.name.length >= 25,
    },
    {
      id: 4,
      label: 'Thêm ít nhất 100 kí tự trong mô tả sản phẩm',
      isDone: data.description.length >= 100,
    },
    {
      id: 5,
      label: 'Thêm thương hiệu',
      isDone: data.attributes.some((a) => a.name === 'Thương hiệu' && a.value.trim().length > 0),
    },
  ];
}

export default function SuggestionPanel({ formData }: SuggestionPanelProps) {
  const suggestions = computeSuggestions(formData);

  return (
    <aside className='w-72 shrink-0 border-r border-slate-100 bg-white'>
      <div className='border-b-2 border-[#EE4D2D] px-5 py-4'>
        <h2 className='text-sm font-medium text-slate-800'>Gợi ý điền Thông tin</h2>
      </div>
      <ul className='py-2'>
        {suggestions.map((item) => (
          <li key={item.id} className='flex items-start gap-2.5 px-5 py-2.5 text-sm'>
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                item.isDone ? 'border-[#42B54A] bg-[#42B54A] text-white' : 'border-slate-300'
              }`}
            >
              {item.isDone && (
                <svg
                  width='10'
                  height='10'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='3'
                >
                  <path d='m5 13 4 4L19 7' />
                </svg>
              )}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
