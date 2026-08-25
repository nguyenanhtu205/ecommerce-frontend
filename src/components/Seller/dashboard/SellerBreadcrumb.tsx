import { Link } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  path?: string;
};

type SellerBreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function SellerBreadcrumb({ items, className }: SellerBreadcrumbProps) {
  return (
    <nav
      className={`flex items-center gap-1.5 border-b border-slate-100 bg-white px-6 py-3 text-xs text-slate-400 ${className}`}
    >
      {items.map((item, idx) => (
        <span key={idx} className='flex items-center gap-1.5'>
          {idx > 0 && <span>&gt;</span>}
          {item.path ? (
            <Link to={item.path} className='hover:text-[#EE4D2D]'>
              {item.label}
            </Link>
          ) : (
            <span className='text-slate-600'>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
