import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, ShoppingCart, Trash2, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import useWishlist from '../hooks/useWishlist';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { fetchServerCart } from '../redux/slices/cartSlice';
import EmptyState from '../components/common/EmptyState';
import PriceTag from '../components/product/PriceTag';
import StockBadge from '../components/product/StockBadge';
import RatingStars from '../components/common/RatingStars';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, isLoading, moveToCart } = useWishlist();
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (productId) => {
    setProcessingId(productId);
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error?.message || 'Could not remove item');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    setProcessingId(product._id);
    try {
      await moveToCart(product._id);
      dispatch(fetchServerCart());
      toast.success(`${product.name} moved to cart`);
    } catch (error) {
      toast.error(error?.message || 'Could not move item to cart');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container-app py-8">
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">My Wishlist</h1>

      {isLoading && items.length === 0 ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            message="Save products you love and come back to them anytime."
            actionLabel="Discover Products"
            actionTo="/products"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <div key={product._id} className="card flex flex-col overflow-hidden">
              <Link to={`/products/${product.slug}`} className="aspect-square w-full overflow-hidden bg-slate-100">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageOff className="h-10 w-10" />
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link to={`/products/${product.slug}`} className="line-clamp-2 font-display text-sm font-semibold text-slate-900 hover:text-indigo-600">
                  {product.name}
                </Link>
                <RatingStars rating={product.rating || 0} reviewCount={product.numReviews} size="sm" />
                <PriceTag price={product.price} discountPrice={product.discountPrice} size="sm" />
                <StockBadge stock={product.stock} />

                <div className="mt-auto flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    disabled={processingId === product._id || product.stock <= 0}
                    className="btn-primary flex-1 !px-3 !py-2 text-xs"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Move to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    disabled={processingId === product._id}
                    aria-label="Remove from wishlist"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
