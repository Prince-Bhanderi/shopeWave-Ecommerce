import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { FormInput, FormTextarea } from '../common/FormField';
import uploadService from '../../api/uploadService';

const schema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  description: z.string().max(500).optional(),
});

const CategoryFormModal = ({ isOpen, onClose, onSave, initialValue, isSaving }) => {
  const [image, setImage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      reset({ name: initialValue?.name || '', description: initialValue?.description || '' });
      setImage(initialValue?.image?.url ? initialValue.image : null);
      setPendingFile(null);
    }
  }, [isOpen, initialValue, reset]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = '';
  };

  const submit = async (values) => {
    try {
      let finalImage = image;
      if (pendingFile) {
        setIsUploading(true);
        const res = await uploadService.uploadImages([pendingFile], 'categories');
        finalImage = res.data.data[0];
        setIsUploading(false);
      }
      await onSave({ ...values, image: finalImage || undefined });
    } catch (error) {
      toast.error(error?.message || 'Could not upload image');
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? 'Edit Category' : 'Add Category'} size="md">
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <FormInput label="Category Name" required {...register('name')} error={errors.name?.message} />
        <FormTextarea label="Description" rows={3} {...register('description')} error={errors.description?.message} />

        <div>
          <span className="label-field">Category Image</span>
          {pendingFile || image?.url ? (
            <div className="relative inline-block">
              <img
                src={pendingFile ? URL.createObjectURL(pendingFile) : image.url}
                alt=""
                className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPendingFile(null);
                }}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500">
              <ImagePlus className="h-5 w-5" />
              <span className="text-[11px] font-medium">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isSaving || isUploading} className="btn-primary">
            {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;
