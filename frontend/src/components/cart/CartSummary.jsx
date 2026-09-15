import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';

const CartSummary = ({ showCouponField = true, showCheckoutButton = false, onCheckout, checkoutLabel = 'Proceed to Checkout' }) => {
  const { subtotal, discount, shippingCost, tax, totalPrice, coupon, applyCoupon, removeCoupon, items } = useCart();
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsApplying(true);
    try {
      await applyCoupon(code.trim());
      toast.success('Coupon applied!');
      setCode('');
    } catch (error) {
      toast.error(error?.message || 'Invalid coupon code');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Coupon removed');
    } catch (error) {
      toast.error(error?.message || 'Could not remove coupon');
    }
  };

  return (
    <div className="card space-y-4 p-5">
      <h2 className="font-display text-base font-semibold text-slate-900">Order Summary</h2>

      {showCouponField && (
        <div>
          {coupon?.code ? (
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <Tag className="h-4 w-4" /> {coupon.code} applied
              </span>
              <button type="button" onClick={handleRemoveCoupon} aria-label="Remove coupon" className="text-emerald-600 hover:text-emerald-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={isAuthenticated ? 'Coupon code' : 'Log in to use a coupon'}
                disabled={!isAuthenticated}
                className="input-field flex-1"
              />
              <button type="submit" disabled={isApplying || !isAuthenticated} className="btn-secondary shrink-0">
                Apply
              </button>
            </form>
          )}
        </div>
      )}

      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</dt>
          <dd className="font-medium text-slate-900">{formatCurrency(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <dt>Discount</dt>
            <dd className="font-medium">-{formatCurrency(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-slate-500">Shipping</dt>
          <dd className="font-medium text-slate-900">{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Tax</dt>
          <dd className="font-medium text-slate-900">{formatCurrency(tax)}</dd>
        </div>
      </dl>

      <div className="flex justify-between border-t border-slate-100 pt-4">
        <span className="font-display text-base font-semibold text-slate-900">Total</span>
        <span className="font-display text-xl font-bold text-indigo-600">{formatCurrency(totalPrice)}</span>
      </div>

      {showCheckoutButton && (
        <button type="button" onClick={onCheckout} disabled={items.length === 0} className="btn-primary w-full">
          {checkoutLabel}
        </button>
      )}
    </div>
  );
};

export default CartSummary;
