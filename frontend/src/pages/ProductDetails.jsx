import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShoppingCart, Zap } from 'lucide-react';
import productService from '../api/productService';
import reviewService from '../api/reviewService';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import ImageGallery from '../components/product/ImageGallery';
import PriceTag from '../components/product/PriceTag';
import StockBadge from '../components/product/StockBadge';
import RatingStars from '../components/common/RatingStars';
import WishlistButton from '../components/product/WishlistButton';
import QuantitySelector from '../components/product/QuantitySelector';
import Breadcrumbs from '../components/common/Breadcrumbs';
import RatingDistribution from '../components/product/RatingDistribution';
import ReviewList from '../components/product/ReviewList';
import ReviewForm from '../components/product/ReviewForm';
import ProductGrid from '../components/product/ProductGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ProductDetails = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const loadProduct = useCallback(() => {
    setIsLoading(true);
    setError(null);
    productService
      .getProductById(idOrSlug)
      .then((res) => {
        setProduct(res.data.data.product);
        setRelatedProducts(res.data.data.relatedProducts);
        setQuantity(1);
      })
      .catch((err) => setError(err?.message || 'Product not found'))
      .finally(() => setIsLoading(false));
  }, [idOrSlug]);

  const loadReviews = useCallback((productId) => {
    reviewService
      .getProductReviews(productId, { limit: 20 })
      .then((res) => {
        setReviews(res.data.data);
        setReviewMeta(res.data.meta);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadProduct();
    window.scrollTo({ top: 0 });
  }, [loadProduct]);

  useEffect(() => {
    if (product?._id) loadReviews(product._id);
  }, [product?._id, loadReviews]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-app py-16">
        <ErrorMessage title="Product not found" message={error || 'This product may have been removed.'} onRetry={loadProduct} />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const myReview = reviews.find((r) => r.user?._id === user?._id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(product, quantity);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err?.message || 'Could not add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      await addItem(product, quantity);
      navigate('/checkout');
    } catch (err) {
      toast.error(err?.message || 'Could not proceed to checkout');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast('Please log in to write a review', { icon: 'ℹ️' });
      navigate('/login', { state: { from: { pathname: `/products/${product.slug}` } } });
      return;
    }
    setEditingReview(myReview || null);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async () => {
    try {
      await reviewService.deleteReview(reviewToDelete._id);
      toast.success('Review deleted');
      loadReviews(product._id);
      loadProduct();
    } catch (err) {
      toast.error(err?.message || 'Could not delete review');
    } finally {
      setReviewToDelete(null);
    }
  };

  return (
    <div className="container-app py-8">
      <Breadcrumbs
        items={[
          { label: product.category?.name || 'Shop', to: product.category ? `/products?category=${product.category.slug}` : '/products' },
          { label: product.name },
        ]}
      />

      <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} productName={product.name} />

        <div>
          {product.brand && <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">{product.brand}</p>}
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <RatingStars rating={product.rating || 0} showValue reviewCount={product.numReviews} />
          </div>

          <div className="mt-4">
            <PriceTag price={product.price} discountPrice={product.discountPrice} size="lg" />
          </div>

          <div className="mt-3">
            <StockBadge stock={product.stock} />
          </div>

          <p className="mt-5 leading-relaxed text-slate-600">{product.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">Category</dt>
              <dd className="font-medium text-slate-700">{product.category?.name || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">SKU</dt>
              <dd className="font-medium text-slate-700">{product.sku}</dd>
            </div>
          </dl>

          {!outOfStock ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <QuantitySelector quantity={quantity} onChange={setQuantity} max={product.stock} />
              <button type="button" onClick={handleAddToCart} disabled={isAdding} className="btn-primary flex-1 sm:flex-none">
                <ShoppingCart className="h-4 w-4" /> {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button type="button" onClick={handleBuyNow} disabled={isBuyingNow} className="btn-secondary flex-1 sm:flex-none">
                <Zap className="h-4 w-4" /> Buy Now
              </button>
              <WishlistButton product={product} variant="text" className="w-full sm:w-auto" />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                This product is currently out of stock and cannot be purchased.
              </p>
              <WishlistButton product={product} variant="text" />
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-slate-200 pt-10">
        <h2 className="font-display text-xl font-bold text-slate-900">Customer Reviews</h2>

        <div className="mt-6">
          <RatingDistribution
            averageRating={product.rating || 0}
            numReviews={product.numReviews || 0}
            distribution={reviewMeta?.ratingDistribution}
          />
        </div>

        <div className="mt-6">
          {!showReviewForm && (
            <button type="button" onClick={handleWriteReviewClick} className="btn-secondary">
              {myReview ? 'Edit your review' : 'Write a review'}
            </button>
          )}
          {showReviewForm && (
            <ReviewForm
              productId={product._id}
              existingReview={editingReview}
              onCancel={() => setShowReviewForm(false)}
              onSuccess={() => {
                setShowReviewForm(false);
                loadReviews(product._id);
                loadProduct();
              }}
            />
          )}
        </div>

        <div className="mt-8">
          <ReviewList
            reviews={reviews}
            currentUserId={user?._id}
            isAdmin={isAdmin}
            onEdit={(review) => {
              setEditingReview(review);
              setShowReviewForm(true);
            }}
            onDelete={(review) => setReviewToDelete(review)}
          />
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="mb-6 font-display text-xl font-bold text-slate-900">You may also like</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDeleteReview}
        title="Delete review?"
        message="This will permanently remove your review from this product."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProductDetails;
