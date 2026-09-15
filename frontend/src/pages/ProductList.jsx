import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';
import ProductFiltersBody from '../components/product/ProductFilters';
import Pagination from '../components/common/Pagination';
import Breadcrumbs from '../components/common/Breadcrumbs';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page'), 10) || 1;
  const sort = searchParams.get('sort') || 'newest';
  const keyword = searchParams.get('keyword') || '';

  const queryParams = useMemo(
    () => ({
      keyword: searchParams.get('keyword') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      rating: searchParams.get('rating') || undefined,
      featured: searchParams.get('featured') || undefined,
      sort,
      page,
      limit: 12,
    }),
    [searchParams, sort, page]
  );

  const { products, meta, isLoading, error, reload } = useProducts(queryParams);

  const handleSortChange = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', value);
    next.delete('page');
    setSearchParams(next);
  };

  const handlePageChange = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-app py-8">
      <Breadcrumbs items={[{ label: 'Shop' }]} />

      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{keyword ? `Results for "${keyword}"` : 'All Products'}</h1>
          {meta && <p className="mt-1 text-sm text-slate-500">{meta.total} product{meta.total === 1 ? '' : 's'} found</p>}
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="btn-secondary lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            aria-label="Sort products"
            className="input-field w-full sm:w-56"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort by: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 p-5">
            <ProductFiltersBody availableBrands={meta?.availableBrands} />
          </div>
        </aside>

        <div>
          <ProductGrid products={products} isLoading={isLoading} error={error} onRetry={reload} />
          {meta && meta.totalPages > 1 && (
            <div className="mt-8">
              <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Filters</h2>
              <button type="button" onClick={() => setIsMobileFiltersOpen(false)} aria-label="Close filters" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProductFiltersBody availableBrands={meta?.availableBrands} />
            <button type="button" onClick={() => setIsMobileFiltersOpen(false)} className="btn-primary mt-4 w-full">
              Show {meta?.total ?? ''} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
