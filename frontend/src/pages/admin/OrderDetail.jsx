import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, User } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../api/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/order/OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadOrder = () => {
    setIsLoading(true);
    setError(null);
    adminService
      .getOrderById(id)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(err?.message || 'Order not found'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadOrder, [id]);

  const handleStatusChange = async (status) => {
    setIsUpdating(true);
    try {
      const res = await adminService.updateOrderStatus(id, status);
      setOrder(res.data.data);
      toast.success('Order status updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus) => {
    setIsUpdating(true);
    try {
      const res = await adminService.updatePaymentStatus(id, paymentStatus);
      setOrder(res.data.data);
      toast.success('Payment status updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    setIsUpdating(true);
    try {
      const res = await adminService.cancelOrder(id, 'Cancelled by admin');
      setOrder(res.data.data);
      toast.success('Order cancelled');
    } catch (error) {
      toast.error(error?.message || 'Could not cancel order');
    } finally {
      setIsUpdating(false);
      setShowCancelConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) return <ErrorMessage message={error} onRetry={loadOrder} />;

  return (
    <div className="max-w-5xl space-y-5">
      <Link to="/admin/orders" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Order #{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold text-slate-900">Items</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {order.orderItems.map((item) => (
                <div key={item.product} className="flex items-center gap-3 py-3">
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-md bg-slate-100 object-cover" />
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
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
              <User className="h-4 w-4" /> Customer
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {order.user?.name} &middot; {order.user?.email}
              {order.user?.phone && ` · ${order.user.phone}`}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
              <MapPin className="h-4 w-4" /> Shipping Address
            </h3>
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
        </div>

        <div className="space-y-5">
          <div className="card space-y-2.5 p-5">
            <h3 className="mb-1 font-display text-sm font-semibold text-slate-900">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Shipping</span>
              <span className="font-medium text-slate-900">{formatCurrency(order.shippingCost)}</span>
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

          <div className="card space-y-4 p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
              <CreditCard className="h-4 w-4" /> Manage Order
            </h3>

            <div>
              <label htmlFor="orderStatus" className="label-field">
                Order Status
              </label>
              <select
                id="orderStatus"
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className="input-field"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="paymentStatus" className="label-field">
                Payment Status
              </label>
              <select
                id="paymentStatus"
                value={order.paymentStatus}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                disabled={isUpdating}
                className="input-field capitalize"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
              <button type="button" onClick={() => setShowCancelConfirm(true)} disabled={isUpdating} className="btn-danger w-full">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        message="This will cancel the order, mark payment as refunded (if applicable), and restock items."
        confirmLabel="Cancel Order"
        isLoading={isUpdating}
      />
    </div>
  );
};

export default AdminOrderDetail;
