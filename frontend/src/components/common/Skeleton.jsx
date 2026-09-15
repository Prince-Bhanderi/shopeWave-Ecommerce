import clsx from 'clsx';

export const Skeleton = ({ className = '' }) => (
  <div className={clsx('animate-pulse rounded-md bg-slate-200', className)} />
);

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="space-y-2 p-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
