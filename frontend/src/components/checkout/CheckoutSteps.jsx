import { Check } from 'lucide-react';
import clsx from 'clsx';

const STEPS = ['Customer Info', 'Shipping Address', 'Review Order', 'Payment'];

const CheckoutSteps = ({ currentStep }) => (
  <ol className="flex items-center justify-between gap-2">
    {STEPS.map((label, idx) => {
      const stepNumber = idx + 1;
      const isComplete = stepNumber < currentStep;
      const isActive = stepNumber === currentStep;

      return (
        <li key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-left">
            <span
              className={clsx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                isComplete && 'bg-indigo-600 text-white',
                isActive && 'bg-indigo-600 text-white ring-4 ring-indigo-100',
                !isComplete && !isActive && 'bg-slate-100 text-slate-400'
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
            </span>
            <span className={clsx('hidden text-xs font-medium sm:block', isActive ? 'text-slate-900' : 'text-slate-400')}>
              {label}
            </span>
          </div>
          {stepNumber < STEPS.length && (
            <div className={clsx('mx-2 h-0.5 flex-1', isComplete ? 'bg-indigo-600' : 'bg-slate-100')} />
          )}
        </li>
      );
    })}
  </ol>
);

export default CheckoutSteps;
