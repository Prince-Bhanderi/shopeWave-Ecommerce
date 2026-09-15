import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../common/Modal';
import { FormInput, FormSelect } from '../common/FormField';

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Code must be at least 3 characters')
      .max(20, 'Code must be at most 20 characters')
      .regex(/^[A-Za-z0-9_-]+$/, 'Only letters, numbers, hyphens and underscores allowed'),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number({ invalid_type_error: 'Discount value is required' }).positive('Must be greater than 0'),
    minimumPurchase: z.coerce.number().min(0, 'Cannot be negative').optional().or(z.literal('')),
    expirationDate: z.string().min(1, 'Expiration date is required'),
    usageLimit: z.coerce.number().int().min(1, 'Must be at least 1').optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.discountType !== 'percentage' || Number(data.discountValue) <= 100, {
    message: 'Percentage discount cannot exceed 100',
    path: ['discountValue'],
  });

const toDateInputValue = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const CouponFormModal = ({ isOpen, onClose, onSave, initialValue, isSaving }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { discountType: 'percentage', isActive: true } });

  const discountType = watch('discountType');

  useEffect(() => {
    if (isOpen) {
      reset({
        code: initialValue?.code || '',
        discountType: initialValue?.discountType || 'percentage',
        discountValue: initialValue?.discountValue ?? '',
        minimumPurchase: initialValue?.minimumPurchase ?? 0,
        expirationDate: toDateInputValue(initialValue?.expirationDate),
        usageLimit: initialValue?.usageLimit ?? '',
        isActive: initialValue?.isActive ?? true,
      });
    }
  }, [isOpen, initialValue, reset]);

  const submit = (values) => {
    onSave({
      code: values.code.trim().toUpperCase(),
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      minimumPurchase: values.minimumPurchase === '' ? 0 : Number(values.minimumPurchase),
      expirationDate: values.expirationDate,
      usageLimit: values.usageLimit === '' ? null : Number(values.usageLimit),
      isActive: values.isActive,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? 'Edit Coupon' : 'Add Coupon'} size="md">
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FormInput
          label="Coupon Code"
          required
          placeholder="e.g. WELCOME10"
          className="uppercase"
          {...register('code')}
          error={errors.code?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Discount Type" required {...register('discountType')} error={errors.discountType?.message}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </FormSelect>
          <FormInput
            label={discountType === 'fixed' ? 'Discount Amount ($)' : 'Discount Value (%)'}
            type="number"
            step="0.01"
            min="0"
            required
            {...register('discountValue')}
            error={errors.discountValue?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Minimum Purchase ($)"
            type="number"
            step="0.01"
            min="0"
            hint="Leave as 0 for no minimum"
            {...register('minimumPurchase')}
            error={errors.minimumPurchase?.message}
          />
          <FormInput
            label="Usage Limit"
            type="number"
            min="1"
            placeholder="Unlimited"
            hint="Leave blank for unlimited uses"
            {...register('usageLimit')}
            error={errors.usageLimit?.message}
          />
        </div>

        <FormInput label="Expiration Date" type="date" required {...register('expirationDate')} error={errors.expirationDate?.message} />

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Coupon is active
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save Coupon'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CouponFormModal;
