import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';

const NotFound = () => (
  <div className="container-app flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
      <SearchX className="h-10 w-10" />
    </div>
    <h1 className="mt-6 font-display text-4xl font-extrabold text-slate-900">404</h1>
    <p className="mt-2 text-lg font-semibold text-slate-700">Page not found</p>
    <p className="mt-2 max-w-sm text-sm text-slate-500">
      The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      <Home className="h-4 w-4" /> Back to Home
    </Link>
  </div>
);

export default NotFound;
