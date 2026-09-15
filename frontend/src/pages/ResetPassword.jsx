import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import authService from '../api/authService';
import AuthCard from '../components/auth/AuthCard';
import { FormInput } from '../components/common/FormField';
import { setCredentials } from '../redux/slices/authSlice';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(token, password);
      dispatch(setCredentials(res.data.data));
      toast.success('Password reset successfully. You are now logged in.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error?.message || 'This reset link is invalid or has expired');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password you haven't used before">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput
          label="New Password"
          type="password"
          required
          hint="At least 8 characters"
          {...register('password')}
          error={errors.password?.message}
          autoComplete="new-password"
        />
        <FormInput
          label="Confirm New Password"
          type="password"
          required
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <KeyRound className="h-4 w-4" /> {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
