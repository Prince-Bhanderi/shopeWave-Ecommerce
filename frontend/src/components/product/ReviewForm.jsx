import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import StarRatingInput from './StarRatingInput';
import { FormInput, FormTextarea } from '../common/FormField';
import reviewService from '../../api/reviewService';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(120, 'Title is too long').optional(),
  comment: z.string().min(5, 'Please write at least 5 characters').max(1000, 'Review is too long'),
});

const ReviewForm = ({ productId, existingReview, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(existingReview);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      title: existingReview?.title || '',
      comment: existingReview?.comment || '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = isEditing
        ? await reviewService.updateReview(existingReview._id, values)
        : await reviewService.createReview(productId, values);
      toast.success(isEditing ? 'Review updated' : 'Review submitted. Thank you!');
      onSuccess?.(res.data.data);
    } catch (error) {
      toast.error(error?.message || 'Could not submit your review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <span className="label-field">Your rating</span>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => <StarRatingInput value={field.value} onChange={field.onChange} />}
        />
        {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}
      </div>

      <FormInput label="Title (optional)" placeholder="Sum up your experience" {...register('title')} error={errors.title?.message} />

      <FormTextarea
        label="Your review"
        required
        placeholder="What did you like or dislike? How did you use this product?"
        {...register('comment')}
        error={errors.comment?.message}
      />

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Submitting...' : isEditing ? 'Update review' : 'Submit review'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
