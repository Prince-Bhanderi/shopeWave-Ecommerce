import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import AuthCard from '../components/auth/AuthCard';
import { FormInput } from '../components/common/FormField';
import { mergeGuestCartToServer } from '../redux/slices/cartSlice';
import { fetchWishlist } from '../redux/slices/wishlistSlice';

const schema = z
  .object({
    name: z.string().min(1, 'Full name is required').max(60, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Register = () => {
  const { register: registerUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }) => {
    setIsSubmitting(true);
    try {
      await registerUser(values);
      await Promise.all([dispatch(mergeGuestCartToServer()), dispatch(fetchWishlist())]);
      toast.success('Account created! Welcome to ShopWave.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error?.message || 'Could not create your account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join ShopWave for a faster, more personal shopping experience"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput label="Full Name" required {...register('name')} error={errors.name?.message} autoComplete="name" />
        <FormInput label="Email" type="email" required {...register('email')} error={errors.email?.message} autoComplete="email" />
        <FormInput label="Phone (optional)" type="tel" {...register('phone')} error={errors.phone?.message} autoComplete="tel" />
        <FormInput
          label="Password"
          type="password"
          required
          hint="At least 8 characters"
          {...register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
        />
        <FormInput
          label="Confirm Password"
          type="password"
          required
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <UserPlus className="h-4 w-4" /> {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center text-xs text-slate-400">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </AuthCard>
  );
};

export default Register;
