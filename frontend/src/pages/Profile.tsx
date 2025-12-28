import { useState, useRef } from 'react';
import { User, Mail, Building2, Shield, Key, Camera, Check, X, AlertCircle, Eye, EyeOff, Edit2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { authApi } from '../api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { organizations } = useOrganization();
  
  // Edit profile states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <span className="badge badge-success">Owner</span>;
      case 'ADMIN':
        return <span className="badge badge-primary">Admin</span>;
      default:
        return <span className="badge badge-secondary">Member</span>;
    }
  };

  // Open edit modal
  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditAvatar(null);
    setEditError('');
    setEditSuccess('');
    setShowEditModal(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError('');
    setEditSuccess('');
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setEditError('Ukuran file maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editEmail && !emailRegex.test(editEmail)) {
      setEditError('Format email tidak valid');
      return;
    }

    if (!editName.trim()) {
      setEditError('Nama tidak boleh kosong');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updateData: { name?: string; email?: string; avatar?: string } = {};
      
      if (editName !== user?.name) {
        updateData.name = editName;
      }
      if (editEmail !== user?.email) {
        updateData.email = editEmail;
      }
      if (editAvatar) {
        updateData.avatar = editAvatar;
      }

      const response = await authApi.updateProfile(updateData);
      
      if (response.data.emailChanged) {
        setEditSuccess('Profil berhasil diperbarui. Email baru perlu diverifikasi ulang.');
      } else {
        setEditSuccess('Profil berhasil diperbarui');
      }
      
      // Refresh user data
      await refreshUser();
      
      setTimeout(() => {
        closeEditModal();
      }, 2000);
    } catch (error: any) {
      setEditError(error.response?.data?.error || 'Gagal memperbarui profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate
    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || 'Gagal mengubah password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowChangePassword(false);
  };

  const emailWillChange = editEmail !== user?.email;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Kelola informasi akun Anda</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-6 relative">
        {/* Edit Button - Top Right */}
        <button
          onClick={openEditModal}
          className="absolute top-4 right-4 flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <Edit2 size={14} />
          <span>Edit</span>
        </button>

        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Profile Photo */}
          <div className="relative">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-24 h-24 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <button 
              onClick={openEditModal}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
            >
              <Camera size={14} className="text-gray-600 dark:text-dark-300" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left space-y-4 w-full">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                Nama Lengkap
              </label>
              <div className="flex items-center gap-2 mt-1">
                <User size={18} className="text-gray-400 dark:text-dark-400" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.name || '-'}
                </p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                Email
              </label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Mail size={18} className="text-gray-400 dark:text-dark-400" />
                <p className="text-gray-900 dark:text-white">
                  {user?.email || '-'}
                </p>
                {user?.isVerified && (
                  <span className="badge badge-success text-xs">
                    <Check size={12} className="mr-1" />
                    Terverifikasi
                  </span>
                )}
              </div>
            </div>

            {/* Login Method Badge */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                Metode Login
              </label>
              <div className="flex items-center gap-2 mt-1">
                {user?.provider === 'google' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg">
                    <Mail size={16} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email & Password</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Card */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Organisasi Saya</h2>
        </div>

        <div className="space-y-3">
          {organizations.length === 0 ? (
            <p className="text-gray-500 dark:text-dark-400 text-sm">Tidak ada organisasi</p>
          ) : (
            organizations.map((org) => (
              <div 
                key={org.id} 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center font-bold text-white">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{org.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">Slug: {org.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(org.role)}
                  {org.isDefault && (
                    <span className="badge badge-secondary text-xs">Default</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Card - Only show for local (email/password) users */}
      {user?.provider !== 'google' && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keamanan</h2>
          </div>

        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-3 p-4 w-full bg-gray-50 dark:bg-dark-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Key size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Ganti Password</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                Ubah password login akun Anda
              </p>
            </div>
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Error/Success Message */}
            {passwordError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="alert alert-success">
                <Check size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Masukkan password saat ini"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Masukkan password baru (minimal 6 karakter)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Ulangi password baru"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetPasswordForm}
                className="btn btn-secondary"
                disabled={isChangingPassword}
              >
                <X size={16} />
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <div className="spinner" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Simpan Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          
          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profil</h2>
                <button 
                  onClick={closeEditModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                {/* Error/Success Messages */}
                {editError && (
                  <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <span>{editError}</span>
                  </div>
                )}
                {editSuccess && (
                  <div className="alert alert-success">
                    <Check size={18} />
                    <span>{editSuccess}</span>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {editAvatar ? (
                      <img 
                        src={editAvatar} 
                        alt="Avatar Preview" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                        {editName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <Camera size={14} className="text-white" />
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-dark-400">
                    Klik untuk mengganti foto (maks. 2MB)
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="input"
                    placeholder="Masukkan email"
                    required
                  />
                  {emailWillChange && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg mt-2">
                      <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Mengubah email akan membutuhkan verifikasi ulang. Anda akan menerima email verifikasi di alamat baru.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="btn btn-secondary"
                    disabled={isUpdatingProfile}
                  >
                    <X size={16} />
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <div className="spinner" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
