import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, CreditCard, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import orderService from '../api/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/order/OrderStatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const PAYMENT_METHOD_LABELS = {
  COD: 'Cash on Delivery',
  Stripe: 'Card (Stripe)',
    Cashfree: 'Cashfree',
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrder = () => {
    setIsLoading(true);
    setError(null);
    orderService
      .getOrderById(id)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(err?.message || 'Order not found'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(id, 'Cancelled by customer');
      setOrder(res.data.data);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err?.message || 'Could not cancel order');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-app py-16">
        <ErrorMessage title="We couldn't find that order" message={error} onRetry={loadOrder} />
      </div>
    );
  }

  const isCancellable = !order.isCancelled && ['Pending', 'Processing'].includes(order.orderStatus);
  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="container-app py-8">
      <Breadcrumbs items={[{ label: 'My Orders', to: '/orders' }, { label: `#${order.orderNumber}` }]} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Status tracker */}
      {order.orderStatus !== 'Cancelled' ? (
        <div className="card mt-6 p-6">
          <ol className="flex items-center">
            {STATUS_STEPS.map((label, idx) => (
              <li key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      idx <= currentStepIndex ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`text-xs font-medium ${idx <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 ${idx < currentStepIndex ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="card mt-6 flex items-center gap-3 border-red-100 bg-red-50 p-5">
          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            This order was cancelled{order.cancelReason ? `: ${order.cancelReason}` : '.'}
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="font-display text-base font-semibold text-slate-900">Items</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {order.orderItems.map((item) => (
                <div key={item.product} className="flex items-center gap-3 py-3">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md bg-slate-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(item.price)} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
              <MapPin className="h-4 w-4" /> Shipping Address
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.addressLine1} {order.shippingAddress.addressLine2}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone} &middot; {order.shippingAddress.email}
            </p>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
              <CreditCard className="h-4 w-4" /> Payment
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Method: <span className="font-medium text-slate-800">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
            </p>
            <p className="text-sm text-slate-600">
              Status: <span className="font-medium capitalize text-slate-800">{order.paymentStatus}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-2.5 p-5">
            <h2 className="mb-1 font-display text-base font-semibold text-slate-900">Order Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Shipping</span>
              <span className="font-medium text-slate-900">{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tax</span>
              <span className="font-medium text-slate-900">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2.5">
              <span className="font-display font-semibold text-slate-900">Total</span>
              <span className="font-display text-lg font-bold text-indigo-600">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>

          {isCancellable && (
            <button type="button" onClick={() => setShowCancelConfirm(true)} className="btn-danger w-full">
              Cancel Order
            </button>
          )}

          <Link to="/orders" className="btn-secondary w-full">
            Back to My Orders
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        message="This will cancel your order and restock the items. This cannot be undone."
        confirmLabel="Yes, cancel order"
        isLoading={isCancelling}
      />
    </div>
  );
};

export default OrderDetails;
