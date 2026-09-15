import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import PriceTag from './PriceTag';
import StockBadge from './StockBadge';
import WishlistButton from './WishlistButton';
import RatingStars from '../common/RatingStars';
import useCart from '../../hooks/useCart';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const image = product.images?.[0]?.url;
  const outOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await addItem(product, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(error?.message || 'Could not add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-colors hover:border-slate-300"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 border-b border-slate-200">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.featured && <span className="badge bg-indigo-600 text-white shadow-sm">Featured</span>}
          {product.discountPrice > 0 && product.discountPrice < product.price && (
            <span className="badge bg-red-600 text-white shadow-sm">
              -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
            </span>
          )}
        </div>

        <WishlistButton product={product} className="absolute right-2.5 top-2.5" />

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
            <span className="badge bg-white text-slate-900">Out of stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brand && <p className="text-xs font-medium text-slate-400">{product.brand}</p>}
        <h3 className="line-clamp-2 font-display text-base font-medium text-slate-900">{product.name}</h3>

        <RatingStars rating={product.rating || 0} reviewCount={product.numReviews} size="sm" />

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <PriceTag price={product.price} discountPrice={product.discountPrice} size="sm" />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <StockBadge stock={product.stock} />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || isAdding}
            aria-label="Add to cart"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;