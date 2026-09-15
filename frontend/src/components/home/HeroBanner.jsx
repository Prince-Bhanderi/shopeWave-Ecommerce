import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';

const HeroBanner = () => (
  <section className="border-b border-slate-200 bg-[--color-paper-dim]">
    <div className="container-app grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
      <div className="text-center lg:text-left">
        <p className="text-sm font-medium text-indigo-700">New season arrivals</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-slate-900 sm:text-5xl lg:text-6xl">
          Things worth
          <br />
          keeping around.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-600 lg:mx-0">
          Electronics, fashion, home goods and more — chosen for quality, shipped fast, and backed
          by easy returns.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
          <Link to="/products" className="btn-primary">
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/products?featured=true" className="btn-secondary">
            View featured
          </Link>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-6 text-sm text-slate-500 lg:justify-start">
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-indigo-600" /> Free shipping over $100
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo-600" /> Secure checkout
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md lg:max-w-none">
        <img
          src="https://picsum.photos/seed/shopwave-hero/900/700"
          alt="Featured products collage"
          className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover"
        />
      </div>
    </div>
  </section>
);

export default HeroBanner;