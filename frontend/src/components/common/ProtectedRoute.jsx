import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

/**
 * Guards nested routes behind authentication, and optionally behind the
 * admin role. Waits for the initial token-validation request to finish
 * before deciding, so a hard refresh on a protected route doesn't
 * momentarily bounce a logged-in user to /login.
 */
const ProtectedRoute = ({ adminOnly = false }) => {
  const { isAuthenticated, isAdmin, bootstrapped, token } = useAuth();
  const location = useLocation();

  if (token && !bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
