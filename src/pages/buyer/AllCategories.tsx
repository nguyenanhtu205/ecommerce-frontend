import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { CategoryGrid } from '@/components';
import { useGetAllCategories, type Category } from '@/hooks';

const CATEGORY_PARENTS = [
  { name: 'Thời Trang Nam', slug: 'thoi-trang-nam' },
  { name: 'Thời Trang Nữ', slug: 'thoi-trang-nu' },
  { name: 'Điện Thoại & Phụ Kiện', slug: 'dien-thoai-phu-kien' },
  { name: 'Mẹ & Bé', slug: 'me-be' },
  { name: 'Thiết Bị Điện Tử', slug: 'thiet-bi-dien-tu' },
  { name: 'Nhà Cửa & Đời Sống', slug: 'nha-cua-doi-song' },
  { name: 'Máy Tính & Laptop', slug: 'may-tinh-laptop' },
  { name: 'Sắc Đẹp', slug: 'sac-dep' },
  { name: 'Máy Ảnh & Máy Quay Phim', slug: 'may-anh-may-quay-phim' },
  { name: 'Sức Khỏe', slug: 'suc-khoe' },
  { name: 'Đồng Hồ', slug: 'dong-ho' },
  { name: 'Giày Dép Nữ', slug: 'giay-dep-nu' },
  { name: 'Giày Dép Nam', slug: 'giay-dep-nam' },
  { name: 'Túi Ví Nữ', slug: 'tui-vi-nu' },
  { name: 'Thiết Bị Điện Gia Dụng', slug: 'thiet-bi-dien-gia-dung' },
  { name: 'Phụ Kiện & Trang Sức Nữ', slug: 'phu-kien-trang-suc-nu' },
  { name: 'Thể Thao & Du Lịch', slug: 'the-thao-du-lich' },
  { name: 'Bách Hóa Online', slug: 'bach-hoa-online' },
  { name: 'Ô Tô & Xe Máy & Xe Đạp', slug: 'o-to-xe-may-xe-dap' },
  { name: 'Nhà Sách Online', slug: 'nha-sach-online' },
  { name: 'Balo & Túi Ví Nam', slug: 'balo-tui-vi-nam' },
  { name: 'Thời Trang Trẻ Em', slug: 'thoi-trang-tre-em' },
  { name: 'Đồ Chơi', slug: 'do-choi' },
  { name: 'Giặt Giũ & Chăm Sóc Nhà Cửa', slug: 'giat-giu-cham-soc-nha-cua' },
  { name: 'Chăm Sóc Thú Cưng', slug: 'cham-soc-thu-cung' },
  { name: 'Voucher & Dịch Vụ', slug: 'voucher-dich-vu' },
  { name: 'Dụng Cụ & Thiết Bị Tiện Ích', slug: 'dung-cu-thiet-bi-tien-ich' },
];

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

function getFirstLetter(name: string): string {
  const normalized = name
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return normalized.charAt(0).toUpperCase();
}

export default function AllCategories() {
  const { data, isPending } = useGetAllCategories();

  const groupedByLetter = useMemo(() => {
    const map = new Map<string, typeof CATEGORY_PARENTS>();
    CATEGORY_PARENTS.forEach((item) => {
      const letter = getFirstLetter(item.name);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(item);
    });
    map.forEach((items) => items.sort((a, b) => a.name.localeCompare(b.name, 'vi')));
    return map;
  }, []);

  const availableLetters = useMemo(() => new Set(groupedByLetter.keys()), [groupedByLetter]);

  const sortedLetters = useMemo(
    () => Array.from(groupedByLetter.keys()).sort((a, b) => a.localeCompare(b)),
    [groupedByLetter],
  );

  const realCategoryBySlug = useMemo(() => {
    const map = new Map<string, Category>();
    data?.forEach((c) => map.set(c.slug, c));
    return map;
  }, [data]);

  const getChildren = (slug: string): Category[] => {
    const realParent = realCategoryBySlug.get(slug);
    if (!realParent || !data) return [];
    return data
      .filter((c) => c.parentId === realParent.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  };

  return (
    <div className='m-10'>
      <CategoryGrid />

      <section className='mt-10 rounded-sm bg-white p-4 px-10 shadow-sm'>
        <div className='sticky top-0 z-10 flex flex-wrap items-center justify-center gap-2 border-b border-gray-100 bg-white py-3 text-sm'>
          {ALPHABET.map((letter, idx) => {
            const active = availableLetters.has(letter);
            return (
              <span key={letter} className='flex items-center gap-2'>
                {active ? (
                  <a
                    href={`#letter-${letter}`}
                    className='font-medium text-[#EE4D2D] hover:underline'
                  >
                    {letter}
                  </a>
                ) : (
                  <span className='text-gray-300'>{letter}</span>
                )}
                {idx < ALPHABET.length - 1 && <span className='mx-2 text-gray-200'>·</span>}
              </span>
            );
          })}
        </div>

        {sortedLetters.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className='scroll-mt-32'>
            <h2 className='sticky top-13 z-5 -mx-8 bg-white px-8 py-2 text-3xl font-medium text-gray-800'>
              {letter}
            </h2>
            <div className='border-t border-gray-100' />

            {groupedByLetter.get(letter)!.map((parent) => {
              const children = getChildren(parent.slug);
              return (
                <div key={parent.slug} className='border-b border-gray-100 py-5'>
                  <Link
                    to={`/${parent.slug}`}
                    className='mb-3 inline-block text-base font-medium text-[#EE4D2D] hover:underline'
                  >
                    {parent.name}
                  </Link>

                  {isPending ? (
                    <div className='columns-2 gap-x-8 sm:columns-3 lg:columns-4'>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className='mb-2 h-4 w-24 animate-pulse break-inside-avoid rounded bg-gray-200'
                        />
                      ))}
                    </div>
                  ) : children.length > 0 ? (
                    <div className='columns-2 gap-x-4 sm:columns-3 lg:columns-4'>
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          to={`/${child.slug}`}
                          className='mb-2 block break-inside-avoid text-sm text-gray-600 hover:text-[#EE4D2D]'
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-400'>Không có danh mục con</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </div>
  );
}
