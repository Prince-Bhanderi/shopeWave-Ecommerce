import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, UserCircle, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const AdminTopbar = ({ onMenuClick, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="font-display text-lg font-semibold text-slate-900">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 sm:flex"
        >
          <Store className="h-4 w-4" /> View store
        </button>

        <div className="relative" ref={ref}>
          <button type="button" onClick={() => setIsOpen((v) => !v)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {user?.name?.[0]?.toUpperCase() || <UserCircle className="h-5 w-5" />}
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:block">{user?.name}</span>
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
