import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  updateProfile as updateProfileThunk,
  changePassword as changePasswordThunk,
  clearAuthError,
} from '../redux/slices/authSlice';
import { resetCartState } from '../redux/slices/cartSlice';
import { resetWishlistState } from '../redux/slices/wishlistSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, status, error, bootstrapped } = useSelector((state) => state.auth);

  const login = useCallback((payload) => dispatch(loginUser(payload)).unwrap(), [dispatch]);
  const register = useCallback((payload) => dispatch(registerUser(payload)).unwrap(), [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    dispatch(resetCartState());
    dispatch(resetWishlistState());
  }, [dispatch]);

  const updateProfile = useCallback((payload) => dispatch(updateProfileThunk(payload)).unwrap(), [dispatch]);
  const changePassword = useCallback((payload) => dispatch(changePasswordThunk(payload)).unwrap(), [dispatch]);
  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    status,
    isLoading: status === 'loading',
    error,
    bootstrapped,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };
};

export default useAuth;
