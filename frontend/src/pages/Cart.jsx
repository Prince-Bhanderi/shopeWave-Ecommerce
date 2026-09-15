import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Cart = () => {
  const { items, clearCart, status } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast('Please log in to continue to checkout', { icon: 'ℹ️' });
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(error?.message || 'Could not clear cart');
    } finally {
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="container-app py-8">
      <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            message="Looks like you haven't added anything yet. Start exploring our products."
            actionLabel="Start Shopping"
            actionTo="/products"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <p className="text-sm font-medium text-slate-500">{items.length} item{items.length === 1 ? '' : 's'} in your cart</p>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" /> Clear cart
                </button>
              </div>
              <div>
                {items.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24">
              <CartSummary showCheckoutButton onCheckout={handleCheckout} checkoutLabel="Proceed to Checkout" />
              {status === 'loading' && <p className="mt-2 text-center text-xs text-slate-400">Syncing cart...</p>}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
        title="Clear your cart?"
        message="All items will be removed from your cart. This cannot be undone."
        confirmLabel="Clear cart"
      />
    </div>
  );
};

export default Cart;
