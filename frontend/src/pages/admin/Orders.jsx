import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, PackageSearch } from 'lucide-react';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';
import adminService from '../../api/adminService';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/order/OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);

  const loadOrders = () => {
    setIsLoading(true);
    adminService
      .getAllOrders({ search: debouncedSearch || undefined, status: status || undefined, paymentStatus: paymentStatus || undefined, page, limit: 12 })
      .then((res) => {
        setOrders(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => toast.error(err?.message || 'Failed to load orders'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadOrders, [debouncedSearch, status, paymentStatus, page]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search order #, customer name or email..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field !w-auto">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }} className="input-field !w-auto">
            <option value="">All Payments</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}

            {!isLoading && orders.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <EmptyState icon={PackageSearch} title="No orders found" message="Try adjusting your search or filters." />
                </td>
              </tr>
            )}

            {!isLoading &&
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{order.user?.name || 'Deleted user'}</p>
                    <p className="text-xs text-slate-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/orders/${order._id}`} className="inline-flex items-center gap-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600" aria-label="View order">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
    </div>
  );
};

export default AdminOrders;
