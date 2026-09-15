import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

const LoadingSpinner = ({ size = 'md', className = '', label = 'Loading' }) => (
  <div className="flex items-center justify-center" role="status" aria-label={label}>
    <Loader2 className={clsx('animate-spin text-indigo-600', sizeMap[size], className)} />
    <span className="sr-only">{label}...</span>
  </div>
);

export default LoadingSpinner;
