import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SlidersHorizontal, X } from 'lucide-react';
import RatingStars from '../common/RatingStars';

const RATING_OPTIONS = [4, 3, 2, 1];

const FilterSection = ({ title, children }) => (
  <div className="border-b border-slate-100 py-5 first:pt-0 last:border-0">
    <h3 className="mb-3 font-display text-sm font-semibold text-slate-900">{title}</h3>
    {children}
  </div>
);

const ProductFiltersBody = ({ availableBrands = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = useSelector((state) => state.categories.items);

  const activeCategory = searchParams.get('category') || '';
  const activeBrands = (searchParams.get('brand') || '').split(',').filter(Boolean);
  const activeRating = searchParams.get('rating') || '';
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const toggleBrand = (brand) => {
    const next = activeBrands.includes(brand) ? activeBrands.filter((b) => b !== brand) : [...activeBrands, brand];
    updateParam('brand', next.join(','));
  };

  const applyPriceRange = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice);
    else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice);
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = activeCategory || activeBrands.length > 0 || activeRating || minPrice || maxPrice;

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h2>
        {hasActiveFilters && (
          <button type="button" onClick={clearAll} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      <FilterSection title="Category">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="radio"
              name="category"
              checked={!activeCategory}
              onChange={() => updateParam('category', '')}
              className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            All categories
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="category"
                checked={activeCategory === cat.slug}
                onChange={() => updateParam('category', cat.slug)}
                className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </FilterSection>

      {availableBrands.length > 0 && (
        <FilterSection title="Brand">
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={activeBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                {brand}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Price range">
        <form onSubmit={applyPriceRange} className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-field"
            aria-label="Minimum price"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field"
            aria-label="Maximum price"
          />
          <button type="submit" className="btn-secondary shrink-0 !px-3">
            Go
          </button>
        </form>
      </FilterSection>

      <FilterSection title="Customer rating">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="radio"
              name="rating"
              checked={!activeRating}
              onChange={() => updateParam('rating', '')}
              className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            All ratings
          </label>
          {RATING_OPTIONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="rating"
                checked={activeRating === String(r)}
                onChange={() => updateParam('rating', String(r))}
                className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <RatingStars rating={r} size="sm" /> &amp; up
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default ProductFiltersBody;
