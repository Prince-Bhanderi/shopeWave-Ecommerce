import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAuth from './useAuth';
import {
  guestAddItem,
  guestUpdateItem,
  guestRemoveItem,
  guestClearCart,
  serverAddItem,
  serverUpdateItem,
  serverRemoveItem,
  serverClearCart,
  serverApplyCoupon,
  serverRemoveCoupon,
} from '../redux/slices/cartSlice';

/**
 * Unified cart interface: components never need to know whether the
 * shopper is a guest (localStorage-backed cart) or logged in
 * (server-persisted cart) - this hook branches internally.
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const cart = useSelector((state) => state.cart);

  const addItem = useCallback(
    (product, quantity = 1) => {
      if (isAuthenticated) {
        return dispatch(serverAddItem({ productId: product._id, quantity })).unwrap();
      }
      dispatch(guestAddItem({ product, quantity }));
      return Promise.resolve();
    },
    [dispatch, isAuthenticated]
  );

  const updateItem = useCallback(
    (item, quantity) => {
      if (isAuthenticated) {
        return dispatch(serverUpdateItem({ itemId: item._id, quantity })).unwrap();
      }
      dispatch(guestUpdateItem({ productId: item.product._id, quantity }));
      return Promise.resolve();
    },
    [dispatch, isAuthenticated]
  );

  const removeItem = useCallback(
    (item) => {
      if (isAuthenticated) {
        return dispatch(serverRemoveItem(item._id)).unwrap();
      }
      dispatch(guestRemoveItem(item.product._id));
      return Promise.resolve();
    },
    [dispatch, isAuthenticated]
  );

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      return dispatch(serverClearCart()).unwrap();
    }
    dispatch(guestClearCart());
    return Promise.resolve();
  }, [dispatch, isAuthenticated]);

  const applyCoupon = useCallback(
    (code) => {
      if (!isAuthenticated) return Promise.reject({ message: 'Please log in to apply a coupon code.' });
      return dispatch(serverApplyCoupon(code)).unwrap();
    },
    [dispatch, isAuthenticated]
  );

  const removeCoupon = useCallback(() => {
    if (!isAuthenticated) return Promise.resolve();
    return dispatch(serverRemoveCoupon()).unwrap();
  }, [dispatch, isAuthenticated]);

  return { ...cart, addItem, updateItem, removeItem, clearCart, applyCoupon, removeCoupon };
};

export default useCart;
