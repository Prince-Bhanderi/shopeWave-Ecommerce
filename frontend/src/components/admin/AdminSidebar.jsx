import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, ShoppingBag, Users, Tag, Store, X } from 'lucide-react';
import clsx from 'clsx';

const LINKS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Categories', to: '/admin/categories', icon: Layers },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Coupons', to: '/admin/coupons', icon: Tag },
];

const SidebarLinks = ({ onNavigate }) => (
  <nav className="space-y-1 px-3">
    {LINKS.map((link) => {
      const { label, to, icon: Icon, end } = link;
      return (
        <NavLink
          key={label}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )
          }
        >
          <Icon className="h-4.5 w-4.5" />
          {label}
        </NavLink>
      );
    })}
  </nav>
);

const AdminSidebar = ({ isMobileOpen, onClose }) => (
  <>
    {/* Desktop sidebar */}
    <aside className="hidden w-64 shrink-0 bg-slate-900 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="font-display text-xl font-extrabold text-white">ShopWave</span>
        <span className="badge bg-indigo-500 text-white">Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarLinks />
      </div>
      <Link to="/" className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
        <Store className="h-4.5 w-4.5" />
        Back to store
      </Link>
    </aside>

    {/* Mobile drawer */}
    {isMobileOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
        <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-slate-900">
          <div className="flex h-16 items-center justify-between px-5">
            <span className="font-display text-xl font-extrabold text-white">ShopWave</span>
            <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarLinks onNavigate={onClose} />
          </div>
          <Link to="/" onClick={onClose} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
            <Store className="h-4.5 w-4.5" />
            Back to store
          </Link>
        </aside>
      </div>
    )}
  </>
);

export default AdminSidebar;
