import { useState } from 'react';
import clsx from 'clsx';
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images = [], productName = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  const active = images[activeIndex];

  const goTo = (index) => setActiveIndex((index + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 sm:flex-1">
        {hasImages ? (
          <img
            key={active.url}
            src={active.url}
            alt={`${productName} - view ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff className="h-16 w-16" />
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
          {images.map((img, idx) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              aria-current={idx === activeIndex}
              className={clsx(
                'aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:w-full',
                idx === activeIndex ? 'border-indigo-600' : 'border-transparent hover:border-slate-300'
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
