/**
 * Central place for all order price math so the same rules apply
 * everywhere (cart preview, checkout, order creation).
 */

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_COST = 9.99;
const TAX_RATE = 0.08; // 8% flat tax - swap for a real tax provider in production

export const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateItemsSubtotal = (items) => {
  return round2(
    items.reduce((sum, item) => {
      const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
      return sum + price * item.quantity;
    }, 0)
  );
};

export const calculateDiscount = (subtotal, coupon) => {
  if (!coupon || !coupon.discountType) return 0;

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed') {
    discount = coupon.discountValue;
  }
  return round2(Math.min(discount, subtotal));
};

export const calculateShipping = (subtotal) => {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
};

export const calculateTax = (taxableAmount) => round2(taxableAmount * TAX_RATE);

export const calculateOrderTotals = ({ items, coupon }) => {
  const subtotal = calculateItemsSubtotal(items);
  const discount = calculateDiscount(subtotal, coupon);
  const shippingCost = calculateShipping(subtotal - discount);
  const tax = calculateTax(subtotal - discount);
  const totalPrice = round2(subtotal - discount + shippingCost + tax);

  return { subtotal, discount, shippingCost, tax, totalPrice };
};

export { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST, TAX_RATE };
