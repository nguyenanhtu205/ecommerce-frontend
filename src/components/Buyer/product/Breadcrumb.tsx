import { Link } from 'react-router-dom';

type CategoryPathItem = {
  id: string;
  slug: string;
  name: string;
};

type BreadcrumbProps = {
  categoryPath: CategoryPathItem[];
  productName: string;
};

export default function Breadcrumb({ categoryPath, productName }: BreadcrumbProps) {
  return (
    <nav className='mb-3 flex flex-wrap items-center gap-1.5 text-xs text-blue-500'>
      <Link to='/' className='hover:underline'>
        Shopee
      </Link>
      {categoryPath.map((node) => (
        <span key={node.id} className='flex items-center gap-1.5'>
          <span>&gt;</span>
          <Link to={`/${node.slug}`} className='hover:underline'>
            {node.name}
          </Link>
        </span>
      ))}
      <span>&gt;</span>
      <span className='max-w-xl truncate text-black'>{productName}</span>
    </nav>
  );
}
