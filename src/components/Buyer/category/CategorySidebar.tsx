import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { List, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { useGetCategorySidebar } from '@/hooks';

const VISIBLE_COUNT = 6;

export default function CategorySidebar() {
  const { slug: routeSlug = '' } = useParams<{ slug: string }>();

  const [querySlug, setQuerySlug] = useState(routeSlug);
  const [activeSlug, setActiveSlug] = useState(routeSlug);
  const [expanded, setExpanded] = useState(false);

  const { data, isPending, errorMessage } = useGetCategorySidebar(querySlug);

  useEffect(() => {
    if (routeSlug === querySlug) {
      setActiveSlug(routeSlug);
      return;
    }

    const matchedItem =
      data?.parent.slug === routeSlug
        ? data.parent
        : data?.items.find((item) => item.slug === routeSlug);

    if (matchedItem?.isLeaf) {
      setActiveSlug(routeSlug);
    } else {
      setQuerySlug(routeSlug);
      setActiveSlug(routeSlug);
    }
  }, [routeSlug]);

  if (isPending) {
    return (
      <aside className='w-full rounded-sm bg-white p-3 shadow-sm'>
        <div className='space-y-2'>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className='h-4 w-4/5 animate-pulse rounded bg-slate-200' />
          ))}
        </div>
      </aside>
    );
  }

  if (errorMessage || !data) {
    return (
      <aside className='w-full rounded-sm bg-white p-3 shadow-sm'>
        <p className='text-xs text-slate-400'>{errorMessage ?? 'Không có dữ liệu danh mục.'}</p>
      </aside>
    );
  }

  const { parent, items } = data;
  const visibleItems = expanded ? items : items.slice(0, VISIBLE_COUNT);
  const hasMore = items.length > VISIBLE_COUNT;

  return (
    <aside className='w-full rounded-sm bg-white shadow-sm'>
      <div className='flex items-center gap-2 border-b border-slate-100 p-3'>
        <List size={18} className='text-black' />
        <Link to={'/all-categories'}>
          <span className='text-sm font-semibold text-black'>Tất Cả Danh Mục</span>{' '}
        </Link>
      </div>

      <nav className='py-1'>
        <Link
          to={`/${parent.slug}`}
          className='flex items-center gap-1 px-3 py-2 text-sm font-semibold text-[#EE4D2D]'
        >
          <ChevronRight size={14} />
          {parent.name}
        </Link>

        <ul>
          {visibleItems.map((item) => {
            const isActive = item.slug === activeSlug;
            return (
              <li key={item.id}>
                <Link
                  to={`/${item.slug}`}
                  className={`block px-3 py-2 pl-6 text-sm transition ${
                    isActive ? 'font-medium text-[#EE4D2D]' : 'text-slate-700 hover:text-[#EE4D2D]'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {hasMore && (
          <button
            type='button'
            onClick={() => setExpanded((prev) => !prev)}
            className='flex w-full items-center gap-1 px-3 py-2 pl-6 text-sm text-slate-700 hover:text-[#EE4D2D]'
          >
            {expanded ? 'Thu gọn' : 'Thêm'}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </nav>
    </aside>
  );
}
