import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist, moveWishlistItemToCart } from '../redux/slices/wishlistSlice';

const useWishlist = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.wishlist);

  const isInWishlist = useCallback((productId) => items.some((p) => p._id === productId), [items]);

  const toggleWishlist = useCallback(
    (product) => {
      if (isInWishlist(product._id)) {
        return dispatch(removeFromWishlist(product._id)).unwrap();
      }
      return dispatch(addToWishlist(product._id)).unwrap();
    },
    [dispatch, isInWishlist]
  );

  const moveToCart = useCallback((productId) => dispatch(moveWishlistItemToCart(productId)).unwrap(), [dispatch]);

  return {
    items,
    isLoading: status === 'loading',
    isInWishlist,
    toggleWishlist,
    moveToCart,
  };
};

export default useWishlist;
