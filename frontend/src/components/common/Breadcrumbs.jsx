import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * items: [{ label: 'Products', to: '/products' }, { label: 'Product name' }]
 * (last item has no `to` - it's the current page)
 */
const Breadcrumbs = ({ items = [] }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
    <Link to="/" className="flex items-center gap-1 hover:text-indigo-600">
      <Home className="h-3.5 w-3.5" />
      <span className="sr-only">Home</span>
    </Link>
    {items.map((item, idx) => (
      <span key={item.label} className="flex items-center gap-1.5">
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        {item.to && idx !== items.length - 1 ? (
          <Link to={item.to} className="hover:text-indigo-600">
            {item.label}
          </Link>
        ) : (
          <span className="font-medium text-slate-700">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumbs;
