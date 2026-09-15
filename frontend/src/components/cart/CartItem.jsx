import { Link } from 'react-router-dom';
import { Trash2, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import QuantitySelector from '../product/QuantitySelector';
import { formatCurrency } from '../../utils/formatters';
import useCart from '../../hooks/useCart';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const image = item.product.images?.[0]?.url;

  const handleQuantityChange = async (quantity) => {
    setIsUpdating(true);
    try {
      await updateItem(item, quantity);
    } catch (error) {
      toast.error(error?.message || 'Could not update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error?.message || 'Could not remove item');
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-4 border-b border-slate-100 py-5 last:border-0">
      <Link to={`/products/${item.product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-24">
        {image ? (
          <img src={image} alt={item.product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Link to={`/products/${item.product.slug}`} className="line-clamp-2 font-display text-sm font-semibold text-slate-900 hover:text-indigo-600">
            {item.product.name}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{formatCurrency(item.unitPrice)} each</p>
          {item.product.stock < item.quantity && (
            <p className="mt-1 text-xs font-medium text-red-600">Only {item.product.stock} left in stock</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <QuantitySelector
            quantity={item.quantity}
            max={Math.max(item.product.stock, 1)}
            onChange={handleQuantityChange}
            size="sm"
          />
          <p className="font-display text-sm font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isUpdating}
          aria-label={`Remove ${item.product.name} from cart`}
          className="self-start rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 sm:self-center"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
