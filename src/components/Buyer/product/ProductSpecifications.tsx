type Specification = {
  title: string;
  value: string;
};

type ProductSpecificationsProps = {
  specifications: Specification[];
};

export default function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  if (specifications.length === 0) return null;

  return (
    <div className='divide-y divide-slate-100 rounded-sm border border-slate-100'>
      {specifications.map((spec) => (
        <div key={spec.title} className='flex gap-6 px-4 py-3 text-sm'>
          <span className='w-40 shrink-0 text-slate-400'>{spec.title}</span>
          <span className='text-slate-700'>{spec.value}</span>
        </div>
      ))}
    </div>
  );
}
