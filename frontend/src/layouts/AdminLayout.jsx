import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/coupons': 'Coupons',
};

const resolveTitle = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/admin/products')) return 'Products';
  if (pathname.startsWith('/admin/orders')) return 'Orders';
  return 'Admin';
};

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setIsMobileOpen(true)} title={resolveTitle(pathname)} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
