import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';

const OrderCard = ({ order }) => (
  <Link to={`/orders/${order._id}`} className="card flex flex-col gap-4 p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
      <Package className="h-6 w-6" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-sm font-semibold text-slate-900">#{order.orderNumber}</p>
        <OrderStatusBadge status={order.orderStatus} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Placed on {formatDate(order.createdAt)} &middot; {order.orderItems.length} item{order.orderItems.length === 1 ? '' : 's'}
      </p>
      <p className="mt-1 truncate text-xs text-slate-400">
        {order.orderItems.map((i) => i.name).join(', ')}
      </p>
    </div>

    <div className="text-left sm:text-right">
      <p className="text-xs text-slate-400">Total</p>
      <p className="font-display text-lg font-bold text-slate-900">{formatCurrency(order.totalPrice)}</p>
    </div>
  </Link>
);

export default OrderCard;
