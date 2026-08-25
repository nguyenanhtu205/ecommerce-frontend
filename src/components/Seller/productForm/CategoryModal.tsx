import { useEffect, useState } from 'react';
import { useGetCategories } from '@/hooks';

type CategoryPathItem = {
  id: string;
  name: string;
};

type CategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (categoryId: string, categoryLabel: string) => void;
};

export default function CategoryModal({ open, onClose, onSelect }: CategoryModalProps) {
  const [path, setPath] = useState<CategoryPathItem[]>([]);

  const currentParentId = path.length > 0 ? path[path.length - 1].id : null;

  const {
    data: categories,
    isPending,
    errorMessage,
  } = useGetCategories({
    parentId: currentParentId,
  });

  useEffect(() => {
    if (open) setPath([]);
  }, [open]);

  if (!open) return null;

  const handleClickCategory = (cat: NonNullable<typeof categories>[number]) => {
    if (cat.isLeaf) {
      const label = [...cat.path, { id: cat.id, name: cat.name }].map((p) => p.name).join(' > ');
      onSelect(cat.id, label);
      return;
    }
    setPath((prev) => [...prev, { id: cat.id, name: cat.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath((prev) => prev.slice(0, index + 1));
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onClose}
    >
      <div
        className='flex max-h-[80vh] w-full max-w-2xl flex-col bg-white shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='border-b border-slate-100 px-6 py-4'>
          <h2 className='text-base font-medium text-slate-800'>Chọn ngành hàng</h2>
        </div>

        <div className='flex flex-wrap items-center gap-1 border-b border-slate-100 px-6 py-3 text-sm'>
          <button
            type='button'
            onClick={() => handleBreadcrumbClick(-1)}
            className={`cursor-pointer hover:text-[#EE4D2D] ${
              path.length === 0 ? 'font-medium text-[#EE4D2D]' : 'text-slate-500'
            }`}
          >
            Tất cả danh mục
          </button>
          {path.map((p, idx) => (
            <span key={p.id} className='flex items-center gap-1'>
              <span className='text-slate-300'>/</span>
              <button
                type='button'
                onClick={() => handleBreadcrumbClick(idx)}
                className={`cursor-pointer hover:text-[#EE4D2D] ${
                  idx === path.length - 1 ? 'font-medium text-[#EE4D2D]' : 'text-slate-500'
                }`}
              >
                {p.name}
              </button>
            </span>
          ))}
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          {isPending && (
            <div className='grid grid-cols-2 gap-1'>
              {Array.from({ length: 24 }).map((_, index) => (
                <div key={index} className='flex h-9 items-center justify-between px-3'>
                  <div className='h-4 w-32 animate-pulse rounded bg-slate-200' />
                  <div className='h-3 w-3 animate-pulse rounded bg-slate-200' />
                </div>
              ))}
            </div>
          )}
          {errorMessage && <p className='px-2 py-4 text-sm text-red-500'>{errorMessage}</p>}
          {!isPending && !errorMessage && categories?.length === 0 && (
            <p className='px-2 py-4 text-sm text-slate-400'>Không có danh mục con.</p>
          )}

          <div className='grid grid-cols-2 gap-1'>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                type='button'
                onClick={() => handleClickCategory(cat)}
                className='flex cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-[#EE4D2D]'
              >
                <span>{cat.name}</span>
                {!cat.isLeaf && (
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    className='shrink-0 text-slate-300'
                  >
                    <path d='m9 18 6-6-6-6' />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className='flex justify-end border-t border-slate-100 px-6 py-3'>
          <button
            type='button'
            onClick={onClose}
            className='cursor-pointer border border-slate-300 px-5 py-1.5 text-sm text-slate-700 hover:bg-slate-50'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
