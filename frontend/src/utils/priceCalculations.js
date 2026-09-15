// Mirrors backend/src/utils/calculatePrices.js so the GUEST cart (computed
// entirely client-side before login) previews the same totals the server
// will calculate once the cart is synced. The server total is always the
// authoritative one at checkout time.

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

export const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const unitPriceOf = (product) =>
  product?.discountPrice && product.discountPrice > 0 ? product.discountPrice : product?.price || 0;

export const calculateCartTotals = (items, coupon) => {
  const subtotal = round2(items.reduce((sum, item) => sum + unitPriceOf(item.product) * item.quantity, 0));

  let discount = 0;
  if (coupon?.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else if (coupon?.discountType === 'fixed') {
    discount = coupon.discountValue;
  }
  discount = round2(Math.min(discount, subtotal));

  const taxableAmount = subtotal - discount;
  const shippingCost = subtotal <= 0 ? 0 : taxableAmount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const tax = round2(taxableAmount * TAX_RATE);
  const totalPrice = round2(subtotal - discount + shippingCost + tax);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discount, shippingCost, tax, totalPrice, totalQuantity };
};

export { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST, TAX_RATE };
