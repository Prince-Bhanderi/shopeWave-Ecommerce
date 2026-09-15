import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import orderService from '../api/orderService';
import OrderCard from '../components/order/OrderCard';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Skeleton } from '../components/common/Skeleton';

const STATUS_TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = () => {
    setIsLoading(true);
    setError(null);
    orderService
      .getMyOrders({ page, limit: 8, status: status === 'All' ? undefined : status })
      .then((res) => {
        setOrders(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => setError(err?.message || 'Failed to load orders'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <div className="container-app py-8">
      <Breadcrumbs items={[{ label: 'My Orders' }]} />
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">My Orders</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              status === tab ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}

        {!isLoading && error && <ErrorMessage message={error} onRetry={loadOrders} />}

        {!isLoading && !error && orders.length === 0 && (
          <EmptyState
            icon={PackageSearch}
            title="No orders yet"
            message={status === 'All' ? "You haven't placed any orders yet." : `You have no ${status.toLowerCase()} orders.`}
            actionLabel="Start Shopping"
            actionTo="/products"
          />
        )}

        {!isLoading && !error && orders.map((order) => <OrderCard key={order._id} order={order} />)}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-8">
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default MyOrders;
