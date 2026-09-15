import clsx from 'clsx';
import { formatCurrency } from '../../utils/formatters';

const PriceTag = ({ price, discountPrice, size = 'md', className = '' }) => {
  const hasDiscount = discountPrice && discountPrice > 0 && discountPrice < price;
  const percentOff = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const sizeClasses = {
    sm: { current: 'text-sm', old: 'text-xs' },
    md: { current: 'text-lg', old: 'text-sm' },
    lg: { current: 'text-2xl', old: 'text-base' },
  };

  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      <span className={clsx('font-display font-bold text-slate-900', sizeClasses[size].current)}>
        {formatCurrency(hasDiscount ? discountPrice : price)}
      </span>
      {hasDiscount && (
        <>
          <span className={clsx('text-slate-400 line-through', sizeClasses[size].old)}>{formatCurrency(price)}</span>
          <span className="badge bg-red-100 text-red-700">-{percentOff}%</span>
        </>
      )}
    </div>
  );
};

export default PriceTag;
