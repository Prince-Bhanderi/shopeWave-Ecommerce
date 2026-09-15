import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import couponService from '../../api/couponService';
import CouponFormModal from '../../components/admin/CouponFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';

const getCouponStatus = (coupon) => {
  const isExpired = new Date(coupon.expirationDate) < new Date();
  if (isExpired) return { label: 'Expired', className: 'bg-red-100 text-red-700' };
  if (!coupon.isActive) return { label: 'Inactive', className: 'bg-slate-100 text-slate-600' };
  return { label: 'Active', className: 'bg-emerald-100 text-emerald-700' };
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCoupons = () => {
    setIsLoading(true);
    couponService
      .getCoupons()
      .then((res) => setCoupons(res.data.data))
      .catch((err) => toast.error(err?.message || 'Failed to load coupons'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadCoupons, []);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch = coupon.code.toLowerCase().includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;
      if (!statusFilter) return true;
      return getCouponStatus(coupon).label.toLowerCase() === statusFilter;
    });
  }, [coupons, search, statusFilter]);

  const handleSave = async (values) => {
    setIsSaving(true);
    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id, values);
        toast.success('Coupon updated');
      } else {
        await couponService.createCoupon(values);
        toast.success('Coupon created');
      }
      setIsModalOpen(false);
      setEditingCoupon(null);
      loadCoupons();
    } catch (error) {
      toast.error(error?.message || 'Could not save coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await couponService.deleteCoupon(couponToDelete._id);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (error) {
      toast.error(error?.message || 'Could not delete coupon');
    } finally {
      setIsDeleting(false);
      setCouponToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by coupon code..."
              className="input-field pl-9"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !w-auto">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min. Purchase</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}

            {!isLoading && filteredCoupons.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <EmptyState icon={Ticket} title="No coupons found" message="Try adjusting your search or filters, or create a new coupon." />
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredCoupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <tr key={coupon._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold tracking-wide text-slate-800">{coupon.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `${formatCurrency(coupon.discountValue)} off`}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {coupon.minimumPurchase > 0 ? formatCurrency(coupon.minimumPurchase) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(coupon.expirationDate)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          aria-label="Edit coupon"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCouponToDelete(coupon)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
        }}
        onSave={handleSave}
        initialValue={editingCoupon}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={Boolean(couponToDelete)}
        onClose={() => setCouponToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this coupon?"
        message={`"${couponToDelete?.code}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCoupons;
