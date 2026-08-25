import { useRef, useState, type ChangeEvent } from 'react';
import type {
  ProductFormData,
  VariantGroup,
  VariantGroupOption,
  VariantCombination,
} from '@/types';
import { useRequestUpload, useConfirmUpload } from '@/hooks';

interface SalesInfoTabProps {
  formData: ProductFormData;
  onChange: (patch: Partial<ProductFormData>) => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const PUT_MAX_RETRIES = 2;

async function putFileToUploadUrl(uploadUrl: string, file: File, attempt = 1): Promise<void> {
  let res: Response;

  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
  } catch (err) {
    if (attempt >= PUT_MAX_RETRIES) throw err;
    return putFileToUploadUrl(uploadUrl, file, attempt + 1);
  }

  if (!res.ok) {
    if (attempt >= PUT_MAX_RETRIES) {
      throw new Error(`Upload thất bại (status ${res.status})`);
    }
    return putFileToUploadUrl(uploadUrl, file, attempt + 1);
  }
}

function generateCombinations(groups: VariantGroup[]): VariantCombination[] {
  if (groups.length === 0) return [];
  const valueLists = groups.map((g) => g.options.map((o) => o.value).filter(Boolean));
  if (valueLists.some((list) => list.length === 0)) return [];

  const cartesian = valueLists.reduce<string[][]>(
    (acc, list) => acc.flatMap((combo) => list.map((v) => [...combo, v])),
    [[]],
  );

  return cartesian.map((optionValues) => ({
    key: optionValues.join('|'),
    optionValues,
    price: null,
    stock: 0,
    sku: '',
  }));
}

export default function SalesInfoTab({ formData, onChange }: SalesInfoTabProps) {
  const [uploadingOptionId, setUploadingOptionId] = useState<string | null>(null);
  const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { requestUploadAsync } = useRequestUpload();
  const { confirmUploadAsync } = useConfirmUpload();

  const extractErrorMessage = (err: unknown) =>
    (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
    'Tải lên thất bại. Vui lòng thử lại.';

  const handleAddGroup = () => {
    const newGroup: VariantGroup = { id: crypto.randomUUID(), name: '', options: [] };
    onChange({ variantGroups: [...formData.variantGroups, newGroup] });
  };

  const updateGroup = (groupId: string, patch: Partial<VariantGroup>) => {
    const nextGroups = formData.variantGroups.map((g) =>
      g.id === groupId ? { ...g, ...patch } : g,
    );
    onChange({ variantGroups: nextGroups, combinations: mergeCombinations(nextGroups) });
  };

  const mergeCombinations = (groups: VariantGroup[]): VariantCombination[] => {
    const generated = generateCombinations(groups);

    return generated.map((combo) => {
      const existing = formData.combinations.find((c) => c.key === combo.key);
      return existing ?? combo;
    });
  };

  const handleAddOption = (groupId: string) => {
    const group = formData.variantGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      options: [...group.options, { id: crypto.randomUUID(), value: '', media: null }],
    });
  };

  const handleOptionValueChange = (groupId: string, optionId: string, value: string) => {
    const group = formData.variantGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      options: group.options.map((o) => (o.id === optionId ? { ...o, value } : o)),
    });
  };

  const setOptionMedia = (
    groupId: string,
    optionId: string,
    media: VariantGroupOption['media'],
  ) => {
    const group = formData.variantGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      options: group.options.map((o) => (o.id === optionId ? { ...o, media } : o)),
    });
  };

  const handleOptionImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    groupId: string,
    optionId: string,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setOptionErrors((prev) => ({
        ...prev,
        [optionId]: 'Chỉ chấp nhận ảnh JPEG, PNG, GIF hoặc WebP.',
      }));
      return;
    }

    setOptionErrors((prev) => {
      const { [optionId]: _removed, ...rest } = prev;
      return rest;
    });
    setUploadingOptionId(optionId);

    const localUrl = URL.createObjectURL(file);

    const group = formData.variantGroups.find((g) => g.id === groupId);
    const currentOption = group?.options.find((o) => o.id === optionId);
    if (currentOption?.media) URL.revokeObjectURL(currentOption.media.url);

    try {
      const { assetId, uploadUrl } = await requestUploadAsync({
        contentType: file.type,
        mediaType: 'IMAGE',
      });

      await putFileToUploadUrl(uploadUrl, file);

      const confirmed = await confirmUploadAsync({ id: assetId });

      setOptionMedia(groupId, optionId, { assetId: confirmed.id, url: localUrl });
    } catch (err) {
      URL.revokeObjectURL(localUrl);
      setOptionErrors((prev) => ({ ...prev, [optionId]: extractErrorMessage(err) }));
    } finally {
      setUploadingOptionId(null);
    }
  };

  const removeGroup = (groupId: string) => {
    const group = formData.variantGroups.find((g) => g.id === groupId);
    group?.options.forEach((o) => {
      if (o.media) URL.revokeObjectURL(o.media.url);
    });

    const nextGroups = formData.variantGroups.filter((g) => g.id !== groupId);
    onChange({ variantGroups: nextGroups, combinations: generateCombinations(nextGroups) });
  };

  const updateCombination = (key: string, patch: Partial<VariantCombination>) => {
    onChange({
      combinations: formData.combinations.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    });
  };

  const hasVariants = formData.variantGroups.length > 0;

  return (
    <div className='bg-white p-6 shadow-sm'>
      <h2 className='mb-5 text-base font-medium text-slate-800'>Thông tin bán hàng</h2>

      <div className='flex items-start gap-6'>
        <span className='w-36 shrink-0 pt-2 text-right text-sm text-slate-700'>Phân loại hàng</span>
        <div className='flex-1 space-y-4'>
          {formData.variantGroups.map((group) => (
            <div key={group.id} className='border border-slate-200 p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <input
                  value={group.name}
                  onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                  placeholder='Tên nhóm phân loại (VD: Size, Màu sắc)'
                  className='w-full min-w-70 border-b border-slate-300 pb-1 text-sm font-medium text-slate-700 outline-none focus:border-[#EE4D2D]'
                />
                <button
                  type='button'
                  onClick={() => removeGroup(group.id)}
                  className='text-slate-400 hover:text-red-500'
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='m6 6 12 12M18 6 6 18' />
                  </svg>
                </button>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                {group.options.map((opt) => (
                  <div key={opt.id} className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => fileInputRefs.current[opt.id]?.click()}
                      disabled={uploadingOptionId === opt.id}
                      className='relative h-9 w-9 shrink-0 border border-dashed border-slate-300 hover:border-[#EE4D2D] disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {opt.media ? (
                        <img src={opt.media.url} alt='' className='h-full w-full object-cover' />
                      ) : uploadingOptionId === opt.id ? (
                        <span className='flex h-full items-center justify-center text-[9px] text-slate-400'>
                          ...
                        </span>
                      ) : (
                        <svg
                          width='14'
                          height='14'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300'
                        >
                          <rect x='3' y='3' width='18' height='18' rx='1' />
                          <path d='M9 9h.01M21 15l-5-5-6 6M9 21H5a2 2 0 0 1-2-2v-4' />
                        </svg>
                      )}
                    </button>
                    <input
                      ref={(el) => {
                        fileInputRefs.current[opt.id] = el;
                      }}
                      type='file'
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={(e) => handleOptionImageChange(e, group.id, opt.id)}
                      className='hidden'
                    />
                    <input
                      value={opt.value}
                      maxLength={20}
                      onChange={(e) => handleOptionValueChange(group.id, opt.id, e.target.value)}
                      placeholder='Nhập'
                      className='flex-1 border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-[#EE4D2D]'
                    />
                    {optionErrors[opt.id] && (
                      <span className='text-xs text-red-500'>{optionErrors[opt.id]}</span>
                    )}
                  </div>
                ))}
                <button
                  type='button'
                  onClick={() => handleAddOption(group.id)}
                  className='col-span-2 border border-dashed border-slate-300 px-3 py-1.5 text-left text-sm text-slate-400 hover:border-[#EE4D2D] hover:text-[#EE4D2D]'
                >
                  + Thêm lựa chọn
                </button>
              </div>
            </div>
          ))}

          <button
            type='button'
            onClick={handleAddGroup}
            className='border border-[#EE4D2D] px-4 py-1.5 text-sm text-[#EE4D2D] hover:bg-[#FFF4F1]'
          >
            + Thêm nhóm phân loại
          </button>
        </div>
      </div>

      {hasVariants && formData.combinations.length > 0 && (
        <div className='mt-6 overflow-x-auto'>
          <table className='w-full min-w-max border border-slate-200 text-sm'>
            <thead>
              <tr className='border-b border-slate-200 bg-slate-50 text-left text-slate-500'>
                {formData.variantGroups.map((g) => (
                  <th key={g.id} className='px-3 py-2 font-normal whitespace-nowrap'>
                    {g.name || 'Phân loại'}
                  </th>
                ))}
                <th className='px-3 py-2 font-normal whitespace-nowrap'>Giá</th>
                <th className='px-3 py-2 font-normal whitespace-nowrap'>Kho hàng</th>
                <th className='px-3 py-2 font-normal whitespace-nowrap'>SKU phân loại</th>
              </tr>
            </thead>
            <tbody>
              {formData.combinations.map((combo) => (
                <tr key={combo.key} className='border-b border-slate-100'>
                  {combo.optionValues.map((val, idx) => (
                    <td key={idx} className='px-3 py-2 whitespace-nowrap text-slate-700'>
                      {val}
                    </td>
                  ))}
                  <td className='px-3 py-2'>
                    <input
                      type='number'
                      value={combo.price ?? ''}
                      onChange={(e) =>
                        updateCombination(combo.key, { price: Number(e.target.value) })
                      }
                      className='w-24 border border-slate-300 px-2 py-1 outline-none focus:border-[#EE4D2D]'
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <input
                      type='number'
                      value={combo.stock}
                      onChange={(e) =>
                        updateCombination(combo.key, { stock: Number(e.target.value) })
                      }
                      className='w-24 border border-slate-300 px-2 py-1 outline-none focus:border-[#EE4D2D]'
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <input
                      value={combo.sku}
                      onChange={(e) => updateCombination(combo.key, { sku: e.target.value })}
                      className='w-32 border border-slate-300 px-2 py-1 outline-none focus:border-[#EE4D2D]'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!hasVariants && (
        <div className='mt-6 flex items-start gap-6'>
          <span className='w-36 shrink-0 pt-2 text-right text-sm text-slate-700'>
            Giá / Kho hàng
          </span>
          <div className='flex flex-1 gap-4'>
            <input
              type='number'
              value={formData.basePrice ?? ''}
              onChange={(e) => onChange({ basePrice: Number(e.target.value) })}
              placeholder='Giá'
              className='w-40 border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D]'
            />
            <input
              type='number'
              value={formData.baseStock}
              onChange={(e) => onChange({ baseStock: Number(e.target.value) })}
              placeholder='Kho hàng'
              className='w-40 border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#EE4D2D]'
            />
          </div>
        </div>
      )}
    </div>
  );
}
