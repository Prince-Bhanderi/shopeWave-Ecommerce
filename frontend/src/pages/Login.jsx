import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthCard from '../components/auth/AuthCard';
import { FormInput } from '../components/common/FormField';
import { mergeGuestCartToServer } from '../redux/slices/cartSlice';
import { fetchWishlist } from '../redux/slices/wishlistSlice';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const redirectTo = location.state?.from?.pathname || '/';

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await login(values);
      await Promise.all([dispatch(mergeGuestCartToServer()), dispatch(fetchWishlist())]);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your account to continue shopping"
      footer={
        <>
          Don&rsquo;t have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput label="Email" type="email" required {...register('email')} error={errors.email?.message} autoComplete="email" />
        <div>
          <FormInput
            label="Password"
            type="password"
            required
            {...register('password')}
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <LogIn className="h-4 w-4" /> {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;
