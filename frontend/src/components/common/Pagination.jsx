import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/**
 * Builds a compact page list like: 1 ... 4 5 [6] 7 8 ... 20
 */
const buildPageList = (current, total) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i += 1) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (last) {
      if (i - last === 2) rangeWithDots.push(last + 1);
      else if (i - last > 2) rangeWithDots.push('...');
    }
    rangeWithDots.push(i);
    last = i;
  });

  return rangeWithDots;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="flex h-10 w-10 items-center justify-center text-slate-400">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              p === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
