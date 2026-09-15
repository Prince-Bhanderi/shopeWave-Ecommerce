import { useState } from 'react';
import { Heart } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useWishlist from '../../hooks/useWishlist';

const WishlistButton = ({ product, className = '', variant = 'icon' }) => {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const active = isInWishlist(product._id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast('Please log in to use your wishlist', { icon: 'ℹ️' });
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }

    setIsSubmitting(true);
    try {
      await toggleWishlist(product);
      toast.success(active ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error(error?.message || 'Could not update wishlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="btn-secondary w-full"
      >
        <Heart className={clsx('h-4 w-4', active && 'fill-red-500 text-red-500')} />
        {active ? 'In your wishlist' : 'Add to wishlist'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className={clsx(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-red-500 disabled:opacity-60',
        className
      )}
    >
      <Heart className={clsx('h-4.5 w-4.5', active && 'fill-red-500 text-red-500')} />
    </button>
  );
};

export default WishlistButton;
