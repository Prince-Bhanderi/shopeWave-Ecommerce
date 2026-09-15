export const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
};

// Used only for the Cashfree checkout button - see the CASHFREE_CURRENCY
// comment in the backend's paymentController.js for why Cashfree charges in
// INR while the rest of the store displays USD.
export const formatINR = (value) => {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(number);
};

export const formatDate = (value, options) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(value));
};

export const formatDateTime = (value) =>
  formatDate(value, { hour: 'numeric', minute: '2-digit' });

export const truncate = (text = '', maxLength = 80) =>
  text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;

export const slugify = (text = '') =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
