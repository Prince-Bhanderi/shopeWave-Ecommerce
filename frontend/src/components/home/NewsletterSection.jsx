import { useState } from 'react';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success("You're subscribed! Watch your inbox for exclusive deals.");
    setEmail('');
  };

  return (
    <section className="container-app pb-16">
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-indigo-50 px-6 py-12 text-center sm:px-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Get 10% off your first order</h2>
          <p className="mt-1 text-sm text-slate-600">Subscribe to our newsletter for exclusive deals, new arrivals and more.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            aria-label="Email address"
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary shrink-0">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSection;
