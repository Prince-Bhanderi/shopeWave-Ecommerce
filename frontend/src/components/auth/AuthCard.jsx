import { Link } from 'react-router-dom';

const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-1.5">
          <span className="font-display text-2xl font-extrabold text-indigo-600">Shop</span>
          <span className="font-display text-2xl font-extrabold text-slate-900">Wave</span>
        </Link>
      </div>

      <div className="card p-7 sm:p-8">
        <h1 className="font-display text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-5 text-center text-sm text-slate-500">{footer}</div>}
    </div>
  </div>
);

export default AuthCard;
