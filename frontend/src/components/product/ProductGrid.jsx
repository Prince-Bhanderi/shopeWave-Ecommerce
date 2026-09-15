import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';
import { ProductGridSkeleton } from '../common/Skeleton';
import ErrorMessage from '../common/ErrorMessage';

const ProductGrid = ({ products, isLoading, error, onRetry, emptyMessage = "We couldn't find any products matching your filters." }) => {
  if (isLoading) return <ProductGridSkeleton />;

  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
