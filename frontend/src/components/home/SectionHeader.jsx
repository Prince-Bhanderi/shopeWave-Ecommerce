import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SectionHeader = ({ title, subtitle, viewAllTo }) => (
  <div className="mb-7 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
    <div>
      <h2 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {viewAllTo && (
      <Link to={viewAllTo} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800">
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    )}
  </div>
);

export default SectionHeader;