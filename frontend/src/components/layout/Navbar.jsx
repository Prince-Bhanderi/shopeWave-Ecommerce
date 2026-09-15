import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Search,
  Package,
  LogOut,
  LayoutDashboard,
  UserCircle,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import SearchBar from '../common/SearchBar';
import { toggleMobileMenu, closeMobileMenu } from '../../redux/slices/uiSlice';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/products' },
  { label: 'Featured', to: '/products?featured=true' },
];

const useClickOutside = (ref, onOutside) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const categories = useSelector((state) => state.categories.items);
  const isMobileMenuOpen = useSelector((state) => state.ui.isMobileMenuOpen);

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const categoriesRef = useRef(null);
  const accountRef = useRef(null);
  useClickOutside(categoriesRef, () => setIsCategoriesOpen(false));
  useClickOutside(accountRef, () => setIsAccountOpen(false));

  const handleLogout = async () => {
    setIsAccountOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="hidden bg-indigo-600 py-2 text-center text-xs font-medium text-white sm:block">
        Free shipping on orders over $100 &middot; Use code <span className="font-semibold">WELCOME10</span> for 10% off your first order
      </div>

      <div className="container-app flex h-16 items-center gap-4">
        <button
          type="button"
          onClick={() => dispatch(toggleMobileMenu())}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/" className="flex shrink-0 items-center gap-1.5">
          <span className="font-display text-2xl font-extrabold tracking-tight text-indigo-600">Shop</span>
          <span className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Wave</span>
        </Link>

        <div className="relative hidden lg:block" ref={categoriesRef}>
          <button
            type="button"
            onClick={() => setIsCategoriesOpen((v) => !v)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Categories
            <ChevronDown className={clsx('h-4 w-4 transition-transform', isCategoriesOpen && 'rotate-180')} />
          </button>
          {isCategoriesOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {categories.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">No categories yet</p>}
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setIsCategoriesOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {cat.name}
                  <span className="text-xs text-slate-400">{cat.productCount ?? ''}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-indigo-600' : 'text-slate-700 hover:bg-slate-100'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-1 md:block">
          <SearchBar className="mx-auto max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link to="/wishlist" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Shopping cart">
            <ShoppingCart className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {totalQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setIsAccountOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                aria-label="Account menu"
              >
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </span>
                )}
              </button>
              {isAccountOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setIsAccountOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <UserCircle className="h-4 w-4" /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setIsAccountOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Package className="h-4 w-4" /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsAccountOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="border-t border-slate-100 p-3 md:hidden">
          <SearchBar autoFocus onSubmitted={() => setIsMobileSearchOpen(false)} />
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => dispatch(closeMobileMenu())} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-indigo-600">ShopWave</span>
              <button type="button" onClick={() => dispatch(closeMobileMenu())} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isAuthenticated && (
              <div className="mb-4 flex gap-2">
                <Link to="/login" onClick={() => dispatch(closeMobileMenu())} className="btn-secondary flex-1">
                  Login
                </Link>
                <Link to="/register" onClick={() => dispatch(closeMobileMenu())} className="btn-primary flex-1">
                  Register
                </Link>
              </div>
            )}

            <nav className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => dispatch(closeMobileMenu())}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</p>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => dispatch(closeMobileMenu())}
                  className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {isAuthenticated && (
              <>
                <div className="my-3 border-t border-slate-100" />
                <Link to="/profile" onClick={() => dispatch(closeMobileMenu())} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  My Profile
                </Link>
                <Link to="/orders" onClick={() => dispatch(closeMobileMenu())} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => dispatch(closeMobileMenu())} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(closeMobileMenu());
                    handleLogout();
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
