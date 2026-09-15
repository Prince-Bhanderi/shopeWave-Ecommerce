import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Layers, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import categoryService from '../../api/categoryService';
import { fetchCategories } from '../../redux/slices/categoriesSlice';
import CategoryFormModal from '../../components/admin/CategoryFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (values) => {
    setIsSaving(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, values);
        toast.success('Category updated');
      } else {
        await categoryService.createCategory(values);
        toast.success('Category created');
      }
      dispatch(fetchCategories());
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error(error?.message || 'Could not save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete._id);
      toast.success('Category deleted');
      dispatch(fetchCategories());
    } catch (error) {
      toast.error(error?.message || 'Could not delete category');
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={Layers} title="No categories yet" message="Create your first category to start organizing products." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category._id} className="card overflow-hidden">
              <div className="aspect-[16/9] w-full bg-slate-100">
                {category.image?.url ? (
                  <img src={category.image.url} alt={category.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Layers className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-slate-900">{category.name}</h3>
                  <span className="badge bg-slate-100 text-slate-600">{category.productCount ?? 0} products</span>
                </div>
                {category.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{category.description}</p>}

                <div className="mt-3 flex items-center gap-2">
                  <Link to={`/products?category=${category.slug}`} target="_blank" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
                    <ExternalLink className="h-3.5 w-3.5" /> View products
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(category);
                      setIsModalOpen(true);
                    }}
                    className="ml-auto flex items-center gap-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                    aria-label="Edit category"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(category)}
                    className="flex items-center gap-1 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        initialValue={editingCategory}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this category?"
        message={`"${categoryToDelete?.name}" will be permanently deleted. Categories with existing products cannot be deleted.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCategories;
