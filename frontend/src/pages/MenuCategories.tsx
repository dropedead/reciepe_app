import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, UtensilsCrossed, X, Loader2, AlertCircle } from 'lucide-react';
import { menuCategoriesApi } from '../api';

interface Category {
  id: number;
  name: string;
  description: string | null;
  _count?: { Menu: number };
}

function MenuCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await menuCategoriesApi.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load menu categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: Category | null = null) => {
    setError('');
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editingCategory) {
        await menuCategoriesApi.update(editingCategory.id, formData);
      } else {
        await menuCategoriesApi.create(formData);
      }
      handleCloseModal();
      loadCategories();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Gagal menyimpan kategori');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus kategori menu ini?')) return;
    try {
      await menuCategoriesApi.delete(id);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal menghapus kategori');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Kategori Menu</h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">Kelola kategori untuk mengelompokkan menu</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
        <input
          type="text"
          className="input pl-11"
          placeholder="Cari kategori menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      {filteredCategories.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <UtensilsCrossed size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada kategori menu</h3>
            <p className="text-sm">
              {searchTerm ? 'Tidak ditemukan kategori dengan kata kunci tersebut' : 'Mulai dengan menambahkan kategori menu'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card hidden md:block overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th>Deskripsi</th>
                  <th>Jumlah Menu</th>
                  <th className="w-28">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="font-medium text-gray-900 dark:text-white">{category.name}</td>
                    <td className="text-gray-500 dark:text-dark-400">{category.description || '-'}</td>
                    <td>
                      <span className="badge badge-primary">
                        {category._count?.Menu || 0} menu
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="btn btn-ghost btn-icon text-gray-400 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400"
                          onClick={() => handleOpenModal(category)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon text-gray-400 dark:text-dark-400 hover:text-red-500 dark:hover:text-red-400"
                          onClick={() => handleDelete(category.id)}
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredCategories.map((category) => (
              <div key={category.id} className="card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">{category.description}</p>
                    )}
                    <span className="badge badge-primary mt-2">
                      {category._count?.Menu || 0} menu
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-dark-700">
                  <button
                    className="btn btn-secondary flex-1 text-sm"
                    onClick={() => handleOpenModal(category)}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    className="btn btn-danger flex-1 text-sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Kategori Menu' : 'Tambah Kategori Menu'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                {error && (
                  <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Contoh: Minuman"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Deskripsi (opsional)
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    placeholder="Deskripsi singkat kategori..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuCategories;
