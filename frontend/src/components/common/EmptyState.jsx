import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, message, actionLabel, actionTo, onAction }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
    {Icon && (
      <div className="rounded-full bg-slate-100 p-4">
        <Icon className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>
    )}
    <p className="font-display text-lg font-semibold text-slate-900">{title}</p>
    {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary mt-2">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && !actionTo && (
      <button type="button" onClick={onAction} className="btn-primary mt-2">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
