import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
    <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
    <div>
      <p className="font-display text-base font-semibold text-slate-900">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-600">{message}</p>}
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-secondary mt-1">
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;
