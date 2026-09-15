import { calculateOrderTotals } from './calculatePrices.js';

/**
 * Builds a client-friendly cart payload: populated items using LIVE
 * product pricing (never the stale snapshot stored on the cart item),
 * plus the full price breakdown (subtotal/discount/shipping/tax/total).
 * Any cart line whose product was deleted or deactivated is dropped.
 */
export const buildCartResponse = (cart) => {
  const items = cart.items
    .filter((item) => item.product && item.product.isActive !== false)
    .map((item) => {
      const product = item.product;
      const unitPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
        },
        quantity: item.quantity,
        unitPrice,
        lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
      };
    });

  const totals = calculateOrderTotals({
    items: items.map((i) => ({ price: i.product.price, discountPrice: i.product.discountPrice, quantity: i.quantity })),
    coupon: cart.coupon?.code ? cart.coupon : null,
  });

  return {
    _id: cart._id,
    items,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    coupon: cart.coupon?.code ? cart.coupon : null,
    ...totals,
  };
};
