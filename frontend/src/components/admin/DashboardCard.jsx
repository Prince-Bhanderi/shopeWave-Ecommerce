import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const DashboardCard = (props) => {
  const { icon: Icon, label, value, trend, accent = 'indigo' } = props;
  const accents = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="card flex items-start justify-between p-5">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">{value}</p>
        {typeof trend === 'number' && (
          <p className={clsx('mt-1.5 flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
            {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend)}% vs last period
          </p>
        )}
      </div>
      <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accents[accent])}>
        <Icon className="h-5.5 w-5.5" />
      </div>
    </div>
  );
};

export default DashboardCard;
