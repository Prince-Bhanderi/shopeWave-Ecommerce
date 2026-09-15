import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Send, MailCheck } from 'lucide-react';
import authService from '../api/authService';
import AuthCard from '../components/auth/AuthCard';
import { FormInput } from '../components/common/FormField';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (error) {
      toast.error(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <AuthCard title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <MailCheck className="h-7 w-7" />
          </div>
          <p className="text-sm text-slate-600">
            If an account exists for the email you provided, we&rsquo;ve sent a link to reset your password. It expires in 10
            minutes.
          </p>
          <Link to="/login" className="btn-secondary mt-2 w-full">
            Back to Login
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it"
      footer={
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
          Back to Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormInput label="Email" type="email" required {...register('email')} error={errors.email?.message} autoComplete="email" />
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <Send className="h-4 w-4" /> {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
