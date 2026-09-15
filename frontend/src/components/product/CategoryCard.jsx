import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

const CategoryCard = ({ category }) => (
  <Link
    to={`/products?category=${category.slug}`}
    className="group relative flex aspect-[4/3] w-full flex-col justify-end overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-shadow hover:shadow-md"
  >
    {category.image?.url ? (
      <img
        src={category.image.url}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
        <Layers className="h-10 w-10" />
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
    <div className="relative p-4">
      <p className="font-display text-base font-semibold text-white">{category.name}</p>
      {typeof category.productCount === 'number' && (
        <p className="text-xs text-white/80">{category.productCount} products</p>
      )}
    </div>
  </Link>
);

export default CategoryCard;
