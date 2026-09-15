import { Star } from 'lucide-react';
import clsx from 'clsx';

const sizeMap = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };

/**
 * Read-only star rating display. For an interactive input, see
 * components/product/StarRatingInput.jsx
 */
const RatingStars = ({ rating = 0, size = 'md', showValue = false, reviewCount, className = '' }) => {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={clsx('flex items-center gap-1', className)} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rounded);
          const half = !filled && star - 0.5 === rounded;
          return (
            <span key={star} className="relative inline-block">
              <Star className={clsx(sizeMap[size], 'text-slate-200')} fill="currentColor" />
              {(filled || half) && (
                <Star
                  className={clsx(sizeMap[size], 'absolute inset-0 text-amber-400')}
                  fill="currentColor"
                  style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                />
              )}
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-medium text-slate-700">{rating.toFixed(1)}</span>}
      {typeof reviewCount === 'number' && (
        <span className="text-sm text-slate-500">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
};

export default RatingStars;
