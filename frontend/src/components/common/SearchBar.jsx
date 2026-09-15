import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar = ({ className = '', onSubmitted, autoFocus = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('keyword') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    navigate(trimmed ? `/products?keyword=${encodeURIComponent(trimmed)}` : '/products');
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products, brands and categories..."
          aria-label="Search products"
          className="input-field pl-10 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
