const StockBadge = ({ stock, lowStockThreshold = 5 }) => {
  if (stock <= 0) {
    return <span className="badge bg-red-100 text-red-700">Out of stock</span>;
  }
  if (stock <= lowStockThreshold) {
    return <span className="badge bg-amber-100 text-amber-700">Only {stock} left</span>;
  }
  return <span className="badge bg-emerald-100 text-emerald-700">In stock</span>;
};

export default StockBadge;
