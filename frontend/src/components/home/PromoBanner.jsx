import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PromoBanner = ({ title, subtitle, ctaLabel, to, tone = 'dark' }) => (
  <div
    className={
      tone === 'dark'
        ? 'relative overflow-hidden rounded-2xl bg-slate-900 p-8 sm:p-10'
        : 'relative overflow-hidden rounded-2xl bg-amber-50 p-8 sm:p-10'
    }
  >
    <div className="relative z-10 max-w-md">
      <h3 className={`font-display text-2xl font-bold ${tone === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`mt-2 text-sm ${tone === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{subtitle}</p>
      <Link
        to={to}
        className={
          tone === 'dark'
            ? 'btn-primary mt-5 bg-white !text-slate-900 hover:bg-slate-100'
            : 'btn-primary mt-5'
        }
      >
        {ctaLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    <div
      className={`absolute -right-10 -top-10 h-52 w-52 rounded-full blur-3xl ${tone === 'dark' ? 'bg-indigo-500/20' : 'bg-amber-300/40'}`}
      aria-hidden="true"
    />
  </div>
);

export default PromoBanner;
