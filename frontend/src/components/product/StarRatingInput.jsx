import { useState } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

const StarRatingInput = ({ value = 0, onChange, size = 'lg' }) => {
  const [hovered, setHovered] = useState(0);
  const sizeMap = { md: 'h-6 w-6', lg: 'h-8 w-8' };

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className="rounded p-0.5 transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={clsx(sizeMap[size], (hovered || value) >= star ? 'text-amber-400' : 'text-slate-200')}
            fill="currentColor"
          />
        </button>
      ))}
    </div>
  );
};

export default StarRatingInput;
