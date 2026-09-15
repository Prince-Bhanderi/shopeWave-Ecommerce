import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Search, ImageOff, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';
import adminService from '../../api/adminService';
import productService from '../../api/productService';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatCurrency } from '../../utils/formatters';

const AdminProducts = () => {
  const categories = useSelector((state) => state.categories.items);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = () => {
    setIsLoading(true);
    adminService
      .getAdminProducts({ search: debouncedSearch || undefined, category: category || undefined, stockStatus: stockStatus || undefined, page, limit: 10 })
      .then((res) => {
        setProducts(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => toast.error(err?.message || 'Failed to load products'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadProducts, [debouncedSearch, category, stockStatus, page]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete._id);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error(error?.message || 'Could not delete product');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, SKU, brand..."
            className="input-field pl-9"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="input-field !w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
            className="input-field !w-auto"
          >
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <Link to="/admin/products/new" className="btn-primary shrink-0">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)}

            {!isLoading && products.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState icon={ImageOff} title="No products found" message="Try adjusting your search or filters." />
                </td>
              </tr>
            )}

            {!isLoading &&
              products.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]?.url} alt="" className="h-10 w-10 shrink-0 rounded-md bg-slate-100 object-cover" />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-800">
                          {product.name}
                          {product.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
                        </p>
                        <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(product.discountPrice > 0 ? product.discountPrice : product.price)}
                    {product.discountPrice > 0 && <span className="ml-1 text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? 'Low stock' : 'In stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/products/${product._id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600" aria-label="Edit product">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setProductToDelete(product)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this product?"
        message={`"${productToDelete?.name}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminProducts;
