import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../common/Modal';
import { FormInput } from '../common/FormField';

const schema = z.object({
  label: z.string().min(1, 'Label is required').max(30),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

const AddressFormModal = ({ isOpen, onClose, onSave, initialValue, isSaving }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialValue || {
          label: 'Home',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        }
      );
    }
  }, [isOpen, initialValue, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? 'Edit Address' : 'Add New Address'} size="md">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
        <FormInput label="Label" placeholder="Home, Office, etc." required {...register('label')} error={errors.label?.message} />
        <FormInput label="Address Line 1" required {...register('addressLine1')} error={errors.addressLine1?.message} />
        <FormInput label="Address Line 2 (optional)" {...register('addressLine2')} />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="City" required {...register('city')} error={errors.city?.message} />
          <FormInput label="State" required {...register('state')} error={errors.state?.message} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Postal Code" required {...register('postalCode')} error={errors.postalCode?.message} />
          <FormInput label="Country" required {...register('country')} error={errors.country?.message} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddressFormModal;
