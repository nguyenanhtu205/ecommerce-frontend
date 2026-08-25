import { type SubmitEvent, useEffect, useRef, useState } from 'react';
import { SiShopee } from 'react-icons/si';
import { GoSearch } from 'react-icons/go';
import { FiShoppingCart } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchSuggest, useSearchTrending } from '@/hooks';

const TRENDING_LIMIT = 6;
const SUGGEST_DEBOUNCE_MS = 300;

export default function SearchBar() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, SUGGEST_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keyword]);

  const { data: suggestData } = useSearchSuggest({ q: debouncedKeyword });
  const { data: trendingData } = useSearchTrending({ limit: TRENDING_LIMIT });

  const suggestions = suggestData?.suggestions ?? [];
  const trendingKeywords = trendingData?.items ?? [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setShowSuggestions(false);
    navigate(`/products/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    goToSearch(keyword);
  };

  return (
    <div className='sticky top-10 z-50 shadow-sm'>
      <div className='bg-[#EE4D2D] pt-4 pb-6'>
        <div className='mx-auto flex max-w-7xl items-end gap-8 px-4'>
          {/* Logo */}
          <Link to='/' className='flex shrink-0 items-center gap-2 self-center'>
            <SiShopee className='h-10 w-10 pb-1 text-white' />
            <span className='text-3xl tracking-tight text-white'>Shopee</span>
          </Link>

          {/* Search */}
          <div className='flex-1'>
            <div ref={containerRef} className='relative'>
              <form onSubmit={handleSubmit} className='flex rounded-sm bg-white p-0.75'>
                <input
                  type='text'
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder='Tìm sản phẩm, thương hiệu và tên shop'
                  className='flex-1 px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400'
                />

                <button
                  type='submit'
                  className='flex h-8.5 w-15 cursor-pointer items-center justify-center bg-[#fb5533] hover:bg-[#f35b3a]'
                >
                  <GoSearch className='text-white' />
                </button>
              </form>

              {showSuggestions && debouncedKeyword.length > 0 && suggestions.length > 0 && (
                <div className='absolute top-full right-0 left-0 z-50 mt-1 rounded-sm bg-white shadow-lg'>
                  <ul className='py-1'>
                    {suggestions.slice(0, 15).map((s) => (
                      <li key={s}>
                        <button
                          type='button'
                          onClick={() => goToSearch(s)}
                          className='flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50'
                        >
                          <GoSearch className='h-3.5 w-3.5 text-slate-400' />
                          {s}
                        </button>
                      </li>
                    ))}

                    {suggestions.length > 15 && (
                      <li className='px-4 py-2 text-center text-sm text-slate-400'>...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Trending keywords */}
            <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1'>
              {trendingKeywords.map((item) => {
                const keyword = item.keyword;
                const displayKeyword = keyword.length > 30 ? `${keyword.slice(0, 30)}...` : keyword;

                return (
                  <button
                    key={item.keyword}
                    type='button'
                    onClick={() => goToSearch(item.keyword)}
                    title={keyword}
                    className='cursor-pointer text-xs text-white/90 hover:opacity-80'
                  >
                    {displayKeyword}
                  </button>
                );
              })}
            </div>
          </div>

          {/* cart */}
          <Link to='/cart' className='relative shrink-0 self-center text-white'>
            <FiShoppingCart className='h-6 w-6' />
          </Link>
        </div>
      </div>
    </div>
  );
}
