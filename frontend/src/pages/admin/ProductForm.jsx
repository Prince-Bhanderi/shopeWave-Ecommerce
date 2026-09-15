import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, X, ImagePlus, Star } from 'lucide-react';
import clsx from 'clsx';
import productService from '../../api/productService';
import uploadService from '../../api/uploadService';
import { FormInput, FormTextarea, FormSelect } from '../../components/common/FormField';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const schema = z.object({
  name: z.string().min(1, 'Product name is required').max(120),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number({ invalid_type_error: 'Price is required' }).positive('Price must be greater than 0'),
  discountPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  stock: z.coerce.number({ invalid_type_error: 'Stock is required' }).int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(1, 'SKU is required'),
  featured: z.boolean().optional(),
});

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const categories = useSelector((state) => state.categories.items);

  const [images, setImages] = useState([]); // [{url, publicId}]
  const [pendingFiles, setPendingFiles] = useState([]); // File objects awaiting upload
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { featured: false } });

  useEffect(() => {
    if (!isEditing) return;
    productService
      .getProductById(id)
      .then((res) => {
        const product = res.data.data.product;
        reset({
          name: product.name,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice || '',
          category: product.category?._id || '',
          brand: product.brand,
          stock: product.stock,
          sku: product.sku,
          featured: product.featured,
        });
        setImages(product.images || []);
      })
      .catch((err) => toast.error(err?.message || 'Failed to load product'))
      .finally(() => setIsLoading(false));
  }, [id, isEditing, reset]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removePendingFile = (index) => setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  const removeExistingImage = (urlToRemove) => setImages((prev) => prev.filter((img) => img.url !== urlToRemove));

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      let finalImages = images;

      if (pendingFiles.length > 0) {
        setIsUploading(true);
        const uploadRes = await uploadService.uploadImages(pendingFiles, 'products');
        finalImages = [...images, ...uploadRes.data.data];
        setIsUploading(false);
      }

      if (finalImages.length === 0) {
        toast.error('Please add at least one product image');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...values,
        discountPrice: values.discountPrice === '' ? 0 : values.discountPrice,
        images: finalImages,
      };

      if (isEditing) {
        await productService.updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.message || 'Could not save product');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link to="/admin/products" className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-base font-semibold text-slate-900">Basic Information</h2>
          <FormInput label="Product Name" required {...register('name')} error={errors.name?.message} />
          <FormTextarea label="Description" required rows={5} {...register('description')} error={errors.description?.message} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormSelect label="Category" required {...register('category')} error={errors.category?.message}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </FormSelect>
            <FormInput label="Brand" required {...register('brand')} error={errors.brand?.message} />
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-display text-base font-semibold text-slate-900">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormInput label="Price ($)" type="number" step="0.01" min="0" required {...register('price')} error={errors.price?.message} />
            <FormInput label="Discount Price ($)" type="number" step="0.01" min="0" hint="Optional" {...register('discountPrice')} error={errors.discountPrice?.message} />
            <FormInput label="Stock Quantity" type="number" min="0" required {...register('stock')} error={errors.stock?.message} />
          </div>
          <FormInput label="SKU" required {...register('sku')} error={errors.sku?.message} />

          <label className="flex items-center gap-2.5">
            <input type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="flex items-center gap-1.5 text-sm text-slate-700">
              <Star className="h-4 w-4 text-amber-400" /> Mark as featured product
            </span>
          </label>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-display text-base font-semibold text-slate-900">Product Images</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {images.map((img) => (
              <div key={img.url} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.url)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {pendingFiles.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="group relative aspect-square overflow-hidden rounded-lg border border-dashed border-indigo-300">
                <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover opacity-80" />
                <span className="absolute bottom-1 left-1 badge bg-indigo-600 text-white">New</span>
                <button
                  type="button"
                  onClick={() => removePendingFile(idx)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <label
              className={clsx(
                'flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500'
              )}
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Add image</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            </label>
          </div>
          <p className="text-xs text-slate-400">JPEG, PNG, WEBP or GIF. Up to 5MB per image.</p>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/admin/products" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isUploading ? 'Uploading images...' : isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
