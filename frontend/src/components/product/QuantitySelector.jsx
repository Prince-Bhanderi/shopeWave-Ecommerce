import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';

const QuantitySelector = ({ quantity, onChange, max = 99, min = 1, size = 'md' }) => {
  const decrement = () => onChange(Math.max(min, quantity - 1));
  const increment = () => onChange(Math.min(max, quantity + 1));

  const handleInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;
    onChange(Math.min(max, Math.max(min, val)));
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-lg border border-slate-300 bg-white',
        size === 'sm' ? 'h-9' : 'h-11'
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className="flex h-full w-9 items-center justify-center text-slate-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        value={quantity}
        onChange={handleInput}
        aria-label="Quantity"
        className="h-full w-11 border-x border-slate-200 text-center text-sm font-medium text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className="flex h-full w-9 items-center justify-center text-slate-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default QuantitySelector;
