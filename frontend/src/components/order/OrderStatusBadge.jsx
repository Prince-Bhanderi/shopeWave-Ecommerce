import clsx from 'clsx';

const statusStyles = {
  Pending: 'bg-slate-100 text-slate-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const paymentStyles = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
};

export const OrderStatusBadge = ({ status }) => (
  <span className={clsx('badge', statusStyles[status] || 'bg-slate-100 text-slate-700')}>{status}</span>
);

export const PaymentStatusBadge = ({ status }) => (
  <span className={clsx('badge capitalize', paymentStyles[status] || 'bg-slate-100 text-slate-700')}>{status}</span>
);

export default OrderStatusBadge;
