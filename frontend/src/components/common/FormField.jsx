import { forwardRef } from 'react';
import clsx from 'clsx';

export const FormInput = forwardRef(({ label, error, hint, className = '', required, ...rest }, ref) => (
  <div>
    {label && (
      <label htmlFor={rest.id || rest.name} className="label-field">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      ref={ref}
      id={rest.id || rest.name}
      className={clsx('input-field', error && 'input-error', className)}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${rest.name}-error` : undefined}
      {...rest}
    />
    {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    {error && (
      <p id={`${rest.name}-error`} className="mt-1 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
));
FormInput.displayName = 'FormInput';

export const FormTextarea = forwardRef(({ label, error, className = '', required, rows = 4, ...rest }, ref) => (
  <div>
    {label && (
      <label htmlFor={rest.id || rest.name} className="label-field">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      id={rest.id || rest.name}
      rows={rows}
      className={clsx('input-field resize-y', error && 'input-error', className)}
      aria-invalid={error ? 'true' : 'false'}
      {...rest}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
FormTextarea.displayName = 'FormTextarea';

export const FormSelect = forwardRef(({ label, error, className = '', required, children, ...rest }, ref) => (
  <div>
    {label && (
      <label htmlFor={rest.id || rest.name} className="label-field">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      ref={ref}
      id={rest.id || rest.name}
      className={clsx('input-field', error && 'input-error', className)}
      aria-invalid={error ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
FormSelect.displayName = 'FormSelect';
