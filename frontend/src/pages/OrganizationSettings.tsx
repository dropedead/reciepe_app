import { useState, useRef, useEffect } from 'react';
import { Building2, Camera, Save, AlertCircle, Check, Loader2, Shield } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { organizationsApi } from '../api';
import Toast from '../components/Toast';

interface Organization {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  role: string;
}

const OrganizationSettings = () => {
  const { currentOrganization, refreshOrganizations } = useOrganization();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [newLogo, setNewLogo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user can edit (OWNER or ADMIN)
  const canEdit = organization?.role === 'OWNER' || organization?.role === 'ADMIN';

  useEffect(() => {
    if (currentOrganization) {
      loadOrganization();
    }
  }, [currentOrganization]);

  const loadOrganization = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      const response = await organizationsApi.getById(currentOrganization.id);
      const org = response.data;
      setOrganization({
        ...org,
        role: currentOrganization.role
      });
      setName(org.name || '');
      setDescription(org.description || '');
      setLogoPreview(org.logoUrl || null);
    } catch (error) {
      console.error('Failed to load organization:', error);
      setToast({ message: 'Gagal memuat data organisasi', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({ message: 'Ukuran file maksimal 2MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setNewLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization || !canEdit) return;
    
    if (!name.trim()) {
      setToast({ message: 'Nama organisasi wajib diisi', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const updateData: { name?: string; description?: string; logoUrl?: string } = {};
      
      if (name !== organization.name) {
        updateData.name = name;
      }
      if (description !== (organization.description || '')) {
        updateData.description = description;
      }
      if (newLogo) {
        updateData.logoUrl = newLogo;
      }

      await organizationsApi.update(organization.id, updateData);
      setToast({ message: 'Pengaturan organisasi berhasil disimpan', type: 'success' });
      
      // Refresh organization data and reload page to update sidebar
      await refreshOrganizations();
      setNewLogo(null);
      
      // Reload page after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to update organization:', error);
      setToast({ message: error.response?.data?.error || 'Gagal menyimpan pengaturan', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-500 dark:text-dark-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 dark:text-dark-400 mb-4" />
          <p className="text-gray-500 dark:text-dark-400">Organisasi tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
          <Building2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan Organisasi</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400">Kelola informasi organisasi Anda</p>
        </div>
      </div>

      {/* Access Warning */}
      {!canEdit && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <Shield size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">Akses Terbatas</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Anda hanya dapat melihat pengaturan ini. Hanya Owner dan Admin yang dapat mengubah pengaturan organisasi.
            </p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt={name} 
                className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-gray-200 dark:border-dark-600"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {name?.charAt(0).toUpperCase() || 'O'}
              </div>
            )}
            {canEdit && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                <Camera size={14} className="text-gray-600 dark:text-dark-300" />
              </button>
            )}
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
              disabled={!canEdit}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-dark-400">
            {canEdit ? 'Klik untuk mengganti logo (maks. 2MB)' : 'Logo Organisasi'}
          </p>
        </div>

        {/* Organization Info */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Organisasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Masukkan nama organisasi"
              required
              disabled={!canEdit}
            />
          </div>

          {/* Slug (read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug
            </label>
            <input
              type="text"
              value={organization.slug}
              className="input bg-gray-50 dark:bg-dark-700"
              disabled
            />
            <p className="text-xs text-gray-500 dark:text-dark-400">
              Slug tidak dapat diubah setelah organisasi dibuat
            </p>
          </div>

          {/* Tenant ID (read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tenant ID
            </label>
            <input
              type="text"
              value={organization.id}
              className="input bg-gray-50 dark:bg-dark-700"
              disabled
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Deskripsikan organisasi Anda..."
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Role Anda</p>
            <p className="text-xs text-gray-500 dark:text-dark-400">Hak akses Anda di organisasi ini</p>
          </div>
          <span className={`badge ${
            organization.role === 'OWNER' ? 'badge-success' :
            organization.role === 'ADMIN' ? 'badge-primary' :
            'badge-secondary'
          }`}>
            {organization.role}
          </span>
        </div>

        {/* Submit Button */}
        {canEdit && (
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-700">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Danger Zone - Only for Owner */}
      {organization.role === 'OWNER' && (
        <div className="card p-6 border-red-200 dark:border-red-500/30">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Zona Berbahaya</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tindakan di bawah ini tidak dapat dibatalkan. Harap berhati-hati.
          </p>
          <button
            type="button"
            className="btn bg-red-600 hover:bg-red-700 text-white border-red-600"
            onClick={() => {
              // TODO: Implement delete organization with confirmation
              setToast({ message: 'Fitur hapus organisasi akan segera hadir', type: 'error' });
            }}
          >
            Hapus Organisasi
          </button>
        </div>
      )}
    </div>
  );
};

export default OrganizationSettings;
