import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { MapPin, Plus, Pencil, Trash2, CheckCircle, UserCircle, Camera } from 'lucide-react';
import clsx from 'clsx';
import useAuth from '../hooks/useAuth';
import { FormInput } from '../components/common/FormField';
import AddressFormModal from '../components/profile/AddressFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Breadcrumbs from '../components/common/Breadcrumbs';
import uploadService from '../api/uploadService';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  phone: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const TABS = [
  { id: 'info', label: 'Profile Info' },
  { id: 'password', label: 'Change Password' },
  { id: 'addresses', label: 'Addresses' },
];

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const infoForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '', email: user?.email || '' },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onSaveInfo = async (values) => {
    setIsSavingInfo(true);
    try {
      await updateProfile(values);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not update your profile');
    } finally {
      setIsSavingInfo(false);
    }
  };

  const onChangePassword = async (values) => {
    setIsSavingPassword(true);
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error) {
      toast.error(error?.message || 'Could not change your password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const uploadRes = await uploadService.uploadImages([file], 'avatars');
      const [{ url, publicId }] = uploadRes.data.data;
      await updateProfile({ avatar: { url, publicId } });
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error?.message || 'Could not upload photo');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const saveAddresses = async (nextAddresses) => {
    await updateProfile({ address: nextAddresses });
  };

  const handleSaveAddress = async (values) => {
    setIsSavingAddress(true);
    try {
      let next;
      if (editingAddress?._id) {
        next = user.address.map((a) => (a._id === editingAddress._id ? { ...a, ...values } : a));
      } else {
        const isFirst = !user.address || user.address.length === 0;
        next = [...(user.address || []), { ...values, isDefault: isFirst }];
      }
      await saveAddresses(next);
      toast.success('Address saved');
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error(error?.message || 'Could not save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async () => {
    try {
      const next = user.address.filter((a) => a._id !== addressToDelete._id);
      if (addressToDelete.isDefault && next.length > 0) next[0].isDefault = true;
      await saveAddresses(next);
      toast.success('Address removed');
    } catch (error) {
      toast.error(error?.message || 'Could not remove address');
    } finally {
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const next = user.address.map((a) => ({ ...a, isDefault: a._id === addressId }));
      await saveAddresses(next);
      toast.success('Default address updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update default address');
    }
  };

  return (
    <div className="container-app py-8">
      <Breadcrumbs items={[{ label: 'My Profile' }]} />
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">My Profile</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <div>
          <div className="card flex flex-col items-center gap-3 p-6">
            <div className="relative">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <UserCircle className="h-20 w-20 text-slate-300" />
              )}
              <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
              </label>
            </div>
            <div className="text-center">
              <p className="font-display text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <nav className="card mt-4 space-y-1 p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'info' && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900">Profile Information</h2>
              <form onSubmit={infoForm.handleSubmit(onSaveInfo)} className="mt-5 space-y-4" noValidate>
                <FormInput label="Full Name" required {...infoForm.register('name')} error={infoForm.formState.errors.name?.message} />
                <FormInput label="Email" type="email" required {...infoForm.register('email')} error={infoForm.formState.errors.email?.message} />
                <FormInput label="Phone" type="tel" {...infoForm.register('phone')} error={infoForm.formState.errors.phone?.message} />
                <button type="submit" disabled={isSavingInfo} className="btn-primary">
                  {isSavingInfo ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900">Change Password</h2>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="mt-5 space-y-4" noValidate>
                <FormInput
                  label="Current Password"
                  type="password"
                  required
                  {...passwordForm.register('currentPassword')}
                  error={passwordForm.formState.errors.currentPassword?.message}
                />
                <FormInput
                  label="New Password"
                  type="password"
                  required
                  hint="At least 8 characters"
                  {...passwordForm.register('newPassword')}
                  error={passwordForm.formState.errors.newPassword?.message}
                />
                <FormInput
                  label="Confirm New Password"
                  type="password"
                  required
                  {...passwordForm.register('confirmPassword')}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
                <button type="submit" disabled={isSavingPassword} className="btn-primary">
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-slate-900">Saved Addresses</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="btn-secondary"
                >
                  <Plus className="h-4 w-4" /> Add Address
                </button>
              </div>

              {!user?.address || user.address.length === 0 ? (
                <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <MapPin className="h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">You haven&rsquo;t saved any addresses yet.</p>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {user.address.map((addr) => (
                    <div key={addr._id} className={clsx('rounded-lg border p-4', addr.isDefault ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200')}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">{addr.label}</span>
                        {addr.isDefault && <span className="badge bg-indigo-100 text-indigo-700">Default</span>}
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600">
                        {addr.addressLine1} {addr.addressLine2}
                        <br />
                        {addr.city}, {addr.state} {addr.postalCode}
                        <br />
                        {addr.country}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs font-medium">
                        {!addr.isDefault && (
                          <button type="button" onClick={() => handleSetDefault(addr._id)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                            <CheckCircle className="h-3.5 w-3.5" /> Set default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(addr);
                            setIsAddressModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => setAddressToDelete(addr)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialValue={editingAddress}
        isSaving={isSavingAddress}
      />

      <ConfirmDialog
        isOpen={Boolean(addressToDelete)}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleDeleteAddress}
        title="Delete this address?"
        message="This saved address will be permanently removed from your account."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Profile;
