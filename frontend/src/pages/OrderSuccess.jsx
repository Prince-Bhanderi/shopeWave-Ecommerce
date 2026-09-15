import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Home } from 'lucide-react';
import orderService from '../api/orderService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/formatters';
import { OrderStatusBadge, PaymentStatusBadge } from '../components/order/OrderStatusBadge';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(err?.message || 'Order not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

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
        <ErrorMessage title="We couldn't find that order" message={error} />
      </div>
    );
  }

  return (
    <div className="container-app max-w-2xl py-14">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-slate-900">Order placed successfully!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Thank you for your purchase. A confirmation has been recorded for order{' '}
          <span className="font-semibold text-slate-700">#{order.orderNumber}</span>.
        </p>
      </div>

      <div className="card mt-8 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-400">Order Number</p>
            <p className="font-display text-base font-semibold text-slate-900">#{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Order Date</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <OrderStatusBadge status={order.orderStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
          {order.orderItems.map((item) => (
            <div key={item.product} className="flex items-center gap-3 py-3">
              <img src={item.image} alt={item.name} className="h-14 w-14 rounded-md bg-slate-100 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between border-t border-slate-100 pt-4">
          <span className="font-display text-base font-semibold text-slate-900">Total Paid</span>
          <span className="font-display text-xl font-bold text-indigo-600">{formatCurrency(order.totalPrice)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={`/orders/${order._id}`} className="btn-secondary">
          <Package className="h-4 w-4" /> View Order Details
        </Link>
        <Link to="/" className="btn-primary">
          <Home className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
