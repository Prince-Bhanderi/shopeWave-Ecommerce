import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import adminService from '../../api/adminService';
import DashboardCard from '../../components/admin/DashboardCard';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import SalesChart from '../../components/admin/charts/SalesChart';
import OrdersChart from '../../components/admin/charts/OrdersChart';
import ProductPerformanceChart from '../../components/admin/charts/ProductPerformanceChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ChartCard = ({ title, children }) => (
  <div className="card p-5">
    <h3 className="font-display text-sm font-semibold text-slate-900">{title}</h3>
    <div className="mt-3">{children}</div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    adminService
      .getDashboardStats({ days: 30 })
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err?.message || 'Failed to load dashboard'))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) return <ErrorMessage message={error} onRetry={load} />;

  const { totals, recentOrders, bestSellingProducts, lowStockProducts, salesOverTime } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard icon={DollarSign} label="Total Revenue" value={formatCurrency(totals.revenue)} accent="emerald" />
        <DashboardCard icon={ShoppingBag} label="Total Orders" value={totals.totalOrders.toLocaleString()} accent="indigo" />
        <DashboardCard icon={Users} label="Total Customers" value={totals.totalUsers.toLocaleString()} accent="amber" />
        <DashboardCard icon={Package} label="Total Products" value={totals.totalProducts.toLocaleString()} accent="rose" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Revenue (last 30 days)">
          <RevenueChart data={salesOverTime} />
        </ChartCard>
        <ChartCard title="Sales / Units Sold (last 30 days)">
          <SalesChart data={salesOverTime} />
        </ChartCard>
        <ChartCard title="Orders (last 30 days)">
          <OrdersChart data={salesOverTime} />
        </ChartCard>
        <ChartCard title="Product Performance (top sellers)">
          <ProductPerformanceChart data={bestSellingProducts} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
              <TrendingUp className="h-4 w-4" /> Recent Orders
            </h3>
            <Link to="/admin/orders" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              View all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {recentOrders.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No orders yet</p>}
            {recentOrders.map((order) => (
              <Link key={order._id} to={`/admin/orders/${order._id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">#{order.orderNumber}</p>
                  <p className="text-xs text-slate-500">{order.user?.name || 'Guest'} &middot; {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-slate-800">{formatCurrency(order.totalPrice)}</span>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock Products
          </h3>
          <div className="mt-3 divide-y divide-slate-100">
            {lowStockProducts.length === 0 && <p className="py-6 text-center text-sm text-slate-400">All products are well stocked</p>}
            {lowStockProducts.map((product) => (
              <Link key={product._id} to={`/admin/products/${product._id}/edit`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50">
                <div className="flex min-w-0 items-center gap-3">
                  <img src={product.images?.[0]?.url} alt="" className="h-9 w-9 shrink-0 rounded-md bg-slate-100 object-cover" />
                  <p className="truncate text-sm font-medium text-slate-800">{product.name}</p>
                </div>
                <span className={`badge shrink-0 ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
