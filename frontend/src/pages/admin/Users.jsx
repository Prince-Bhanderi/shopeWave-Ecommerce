import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, Trash2, Users as UsersIcon, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';
import useAuth from '../../hooks/useAuth';
import adminService from '../../api/adminService';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../utils/formatters';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadUsers = () => {
    setIsLoading(true);
    adminService
      .getAllUsers({ search: debouncedSearch || undefined, role: role || undefined, page, limit: 12 })
      .then((res) => {
        setUsers(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => toast.error(err?.message || 'Failed to load users'))
      .finally(() => setIsLoading(false));
  };

  useEffect(loadUsers, [debouncedSearch, role, page]);

  const handleRoleChange = async (userId, nextRole) => {
    setIsMutating(true);
    try {
      await adminService.updateUserRole(userId, nextRole);
      toast.success('User role updated');
      loadUsers();
    } catch (error) {
      toast.error(error?.message || 'Could not update role');
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleBlock = async (targetUser) => {
    setIsMutating(true);
    try {
      await adminService.toggleBlockUser(targetUser._id, !targetUser.isBlocked);
      toast.success(targetUser.isBlocked ? 'User unblocked' : 'User blocked');
      loadUsers();
    } catch (error) {
      toast.error(error?.message || 'Could not update user');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    setIsMutating(true);
    try {
      await adminService.deleteUser(userToDelete._id);
      toast.success('User deleted');
      loadUsers();
    } catch (error) {
      toast.error(error?.message || 'Could not delete user');
    } finally {
      setIsMutating(false);
      setUserToDelete(null);
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
            placeholder="Search by name or email..."
            className="input-field pl-9"
          />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input-field !w-auto">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)}

            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState icon={UsersIcon} title="No users found" message="Try adjusting your search or filters." />
                </td>
              </tr>
            )}

            {!isLoading &&
              users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                return (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={isSelf || isMutating}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="input-field !w-auto !py-1.5 text-xs"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {u.role === 'admin' && (
                          <span className="flex items-center gap-1 rounded-lg p-2 text-indigo-400" title="Admin">
                            <ShieldCheck className="h-4 w-4" />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(u)}
                          disabled={isSelf || isMutating}
                          className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-30"
                          aria-label={u.isBlocked ? 'Unblock user' : 'Block user'}
                        >
                          {u.isBlocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          disabled={isSelf || isMutating}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                          aria-label="Delete user"
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

      {meta && meta.totalPages > 1 && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this user?"
        message={`"${userToDelete?.name}" will be permanently deleted along with their account. This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isMutating}
      />
    </div>
  );
};

export default AdminUsers;
