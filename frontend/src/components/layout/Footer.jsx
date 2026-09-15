import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from '../common/SocialIcons';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', to: '/products' },
    { label: 'Featured', to: '/products?featured=true' },
    { label: 'New Arrivals', to: '/products?sort=newest' },
    { label: 'Best Sellers', to: '/products?sort=popular' },
  ],
  Account: [
    { label: 'My Profile', to: '/profile' },
    { label: 'My Orders', to: '/orders' },
    { label: 'Wishlist', to: '/wishlist' },
    { label: 'Cart', to: '/cart' },
  ],
  Support: [
    { label: 'Contact Us', to: '/#' },
    { label: 'Shipping Info', to: '/#' },
    { label: 'Returns & Refunds', to: '/#' },
    { label: 'FAQs', to: '/#' },
  ],
};

const PERKS = [
  { icon: Truck, label: 'Free shipping', detail: 'On orders over $100' },
  { icon: RotateCcw, label: 'Easy returns', detail: '30-day return policy' },
  { icon: ShieldCheck, label: 'Secure checkout', detail: '100% protected payments' },
  { icon: CreditCard, label: 'Flexible payment', detail: 'Card or cash on delivery' },
];

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success("Thanks for subscribing! You'll hear from us soon.");
    setEmail('');
  };

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-app grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {PERKS.map((perk) => (
            <div key={perk.label} className="flex items-center gap-3">
              <perk.icon className="h-7 w-7 shrink-0 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{perk.label}</p>
                <p className="text-xs text-slate-500">{perk.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-app grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="font-display text-2xl font-extrabold text-indigo-600">Shop</span>
            <span className="font-display text-2xl font-extrabold text-slate-900">Wave</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            Modern online shopping for electronics, fashion, home goods and more &mdash; carefully curated, fast
            shipping, and a checkout you can trust.
          </p>
          <div className="mt-4 flex gap-3">
            {[FacebookIcon, InstagramIcon, XIcon, YoutubeIcon].map((Icon, idx) => (
              <a
                key={idx}
                href="/#"
                onClick={(e) => e.preventDefault()}
                aria-label="Social media link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h3 className="font-display text-sm font-semibold text-slate-900">{title}</h3>
            <ul className="mt-3 space-y-2">
              {links.map((link) =>
                link.to === '/#' ? (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => toast("This page isn't available in the demo yet.")}
                      className="text-sm text-slate-500 hover:text-indigo-600"
                    >
                      {link.label}
                    </button>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-slate-500 hover:text-indigo-600">
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-sm font-semibold text-slate-900">Stay in the loop</h3>
          <p className="mt-3 text-sm text-slate-500">Subscribe for exclusive deals and new arrivals.</p>
          <form onSubmit={handleSubscribe} className="mt-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="input-field pl-9"
              />
            </div>
            <button type="submit" className="btn-primary mt-2 w-full">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ShopWave. All rights reserved.</p>
          <p>Built with React, Node.js, Express &amp; MongoDB.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
