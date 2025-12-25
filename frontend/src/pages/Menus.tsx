import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, UtensilsCrossed, X, TrendingUp, TrendingDown, Check, XCircle, Tags, ChefHat, Upload, Image as ImageIcon, Link, AlertCircle, Filter, RotateCcw, Calendar } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { menusApi, recipesApi, menuCategoriesApi } from '../api';
import { PageSkeleton } from '../components/Skeleton';

function Menus() {
  const [menus, setMenus] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    imageUrl: '',
    categoryId: '',
    sellingPrice: '',
    isActive: true,
    recipes: [{ recipeId: '', quantity: 1 }]
  });
  
  // Image upload states
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imageError, setImageError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    minMargin: '',
    maxMargin: '',
    minHpp: '',
    maxHpp: '',
    startDate: '',
    endDate: ''
  });


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [menusRes, recipesRes, categoriesRes] = await Promise.all([
        menusApi.getAll(),
        recipesApi.getAll(),
        menuCategoriesApi.getAll()
      ]);
      setMenus(menusRes.data);
      setRecipes(recipesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'var(--bg-tertiary)',
      borderColor: state.isFocused ? 'var(--primary)' : 'transparent',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(249, 115, 22, 0.12)' : 'none',
      '&:hover': { borderColor: 'var(--primary)' },
      borderRadius: '12px',
      padding: '6px 4px',
      minHeight: '48px'
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--bg-tertiary)',
      borderRadius: '12px',
      zIndex: 9999
    }),
    menuList: (base: any) => ({ ...base, padding: '8px' }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--bg-tertiary)' : 'transparent',
      color: state.isSelected ? 'white' : 'var(--text-primary)',
      borderRadius: '8px',
      padding: '10px 12px',
      cursor: 'pointer'
    }),
    singleValue: (base: any) => ({ ...base, color: 'var(--text-primary)' }),
    input: (base: any) => ({ ...base, color: 'var(--text-primary)' }),
    placeholder: (base: any) => ({ ...base, color: 'var(--text-muted)' }),
    dropdownIndicator: (base: any) => ({ ...base, color: 'var(--text-muted)' }),
    clearIndicator: (base: any) => ({ ...base, color: 'var(--text-muted)' }),
    noOptionsMessage: (base: any) => ({ ...base, color: 'var(--text-muted)' })
  };

  // Category options for creatable select
  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  // Handle creating new category inline
  const handleCreateCategory = async (inputValue: string) => {
    setIsCreatingCategory(true);
    try {
      const res = await menuCategoriesApi.create({ name: inputValue });
      const newCategory = res.data;
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, categoryId: newCategory.id.toString() }));
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Gagal membuat kategori baru');
    } finally {
      setIsCreatingCategory(false);
    }
  };


  // Handle image file upload with compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    setIsUploadingImage(true);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setImageError('Format file harus JPG atau PNG');
      setIsUploadingImage(false);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setImageError('Ukuran file maksimal 10MB');
      setIsUploadingImage(false);
      return;
    }

    // Read and compress image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Validate minimum resolution (300x300)
        if (img.width < 300 || img.height < 300) {
          setImageError('Resolusi minimal 300x300 piksel');
          setIsUploadingImage(false);
          return;
        }

        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 800px width/height)
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with 70% quality for smaller size
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        console.log('Original size:', Math.round((event.target?.result as string).length / 1024), 'KB');
        console.log('Compressed size:', Math.round(compressedBase64.length / 1024), 'KB');
        
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
        setImagePreview(compressedBase64);
        setIsUploadingImage(false);
      };
      img.onerror = () => {
        setImageError('Gagal membaca gambar');
        setIsUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setImageError('Gagal membaca file');
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Clear image
  const handleClearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview('');
    setImageError('');
  };

  const handleCardClick = async (menu) => {
    try {
      const res = await menusApi.getById(menu.id);
      setSelectedMenu(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to load menu detail:', error);
    }
  };

  const handleAddRecipe = () => {
    setFormData({
      ...formData,
      recipes: [...formData.recipes, { recipeId: '', quantity: 1 }]
    });
  };

  const handleRemoveRecipe = (index) => {
    setFormData({
      ...formData,
      recipes: formData.recipes.filter((_, i) => i !== index)
    });
  };

  const handleRecipeChange = (index, field, value) => {
    const newRecipes = [...formData.recipes];
    newRecipes[index][field] = value;
    setFormData({ ...formData, recipes: newRecipes });
  };

  const handleOpenModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        name: menu.name,
        description: menu.description || '',
        imageUrl: menu.imageUrl || '',
        categoryId: menu.categoryId?.toString() || '',
        sellingPrice: menu.sellingPrice.toString(),
        isActive: menu.isActive,
        recipes: menu.recipes.map(mr => ({
          recipeId: mr.recipeId.toString(),
          quantity: mr.quantity
        }))
      });
    } else {
      setEditingMenu(null);
      setFormData({ 
        name: '', 
        description: '', 
        imageUrl: '',
        categoryId: '',
        sellingPrice: '', 
        isActive: true,
        recipes: [{ recipeId: '', quantity: 1 }]
      });
    }
    // Reset image error
    setImageError('');
    // Set image preview dan mode berdasarkan data menu
    if (menu && menu.imageUrl) {
      setImagePreview(menu.imageUrl);
      setImageMode(menu.imageUrl.startsWith('data:') ? 'upload' : 'url');
    } else {
      setImagePreview('');
      setImageMode('url');
    }
    setShowDetailModal(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMenu(null);
    // Reset image states
    setImagePreview('');
    setImageError('');
    setImageMode('url');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (!formData.name.trim()) {
      alert('Nama menu wajib diisi!');
      return;
    }
    
    const validRecipes = formData.recipes.filter(r => r.recipeId);
    
    if (validRecipes.length === 0) {
      alert('Tambahkan minimal satu resep!');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        recipes: validRecipes
      };
      
      // Debug: log data size
      const dataSize = JSON.stringify(dataToSubmit).length;
      console.log('Data size being sent:', Math.round(dataSize / 1024), 'KB');
      
      if (editingMenu) {
        await menusApi.update(editingMenu.id, dataToSubmit);
      } else {
        await menusApi.create(dataToSubmit);
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      console.error('Failed to save menu:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
      // Show more detailed error
      const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
      alert(`Gagal menyimpan menu: ${errorMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus menu ini?')) {
      try {
        await menusApi.delete(id);
        setShowDetailModal(false);
        loadData();
      } catch (error) {
        console.error('Failed to delete menu:', error);
      }
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      minMargin: '',
      maxMargin: '',
      minHpp: '',
      maxHpp: '',
      startDate: '',
      endDate: ''
    });
  };
  
  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const filteredMenus = menus.filter(menu => {
    // Search filter
    if (searchTerm && !menu.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.categoryId && menu.categoryId?.toString() !== filters.categoryId) {
      return false;
    }
    
    // Price range filter
    if (filters.minPrice && menu.sellingPrice < parseFloat(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && menu.sellingPrice > parseFloat(filters.maxPrice)) {
      return false;
    }
    
    // Margin range filter
    const margin = menu.sellingPrice > 0 ? (menu.profit / menu.sellingPrice) * 100 : 0;
    if (filters.minMargin && margin < parseFloat(filters.minMargin)) {
      return false;
    }
    if (filters.maxMargin && margin > parseFloat(filters.maxMargin)) {
      return false;
    }
    
    // HPP range filter
    if (filters.minHpp && menu.totalCost < parseFloat(filters.minHpp)) {
      return false;
    }
    if (filters.maxHpp && menu.totalCost > parseFloat(filters.maxHpp)) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate) {
      const menuDate = new Date(menu.createdAt);
      const startDate = new Date(filters.startDate);
      if (menuDate < startDate) return false;
    }
    if (filters.endDate) {
      const menuDate = new Date(menu.createdAt);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the end date
      if (menuDate > endDate) return false;
    }
    
    return true;
  });

  // Calculate preview total cost
  const calculatePreviewCost = () => {
    return formData.recipes.reduce((sum, r) => {
      if (!r.recipeId) return sum;
      const recipe = recipes.find(rec => rec.id.toString() === r.recipeId);
      if (!recipe) return sum;
      return sum + (recipe.costPerServing * (Number(r.quantity) || 1));
    }, 0);
  };

  const previewCost = calculatePreviewCost();
  const previewProfit = formData.sellingPrice ? parseFloat(formData.sellingPrice) - previewCost : 0;
  const previewMargin = formData.sellingPrice && parseFloat(formData.sellingPrice) > 0
    ? (previewProfit / parseFloat(formData.sellingPrice)) * 100
    : 0;

  if (loading) {
    return <PageSkeleton type="cards" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Master Menu</h1>
        <p className="text-gray-500 dark:text-dark-400">Kelola daftar menu dengan beberapa resep dan hitung keuntungan</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-secondary'} relative`}
            onClick={() => setShowFilterModal(true)}
          >
            <Filter size={18} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
        <button className="btn btn-primary flex-1 sm:flex-none" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Menu
        </button>
      </div>
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter size={20} className="text-primary-500" />
                Filter Menu
              </h3>
              <button 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 flex items-center justify-center text-gray-500 dark:text-dark-400 transition-colors"
                onClick={() => setShowFilterModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                <Select
                  options={[
                    { value: '', label: 'Semua Kategori' },
                    ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
                  ]}
                  value={filters.categoryId 
                    ? { value: filters.categoryId, label: categories.find(c => c.id.toString() === filters.categoryId)?.name || '' }
                    : { value: '', label: 'Semua Kategori' }
                  }
                  onChange={(option) => setFilters({ ...filters, categoryId: option?.value || '' })}
                  styles={selectStyles}
                  placeholder="Pilih Kategori"
                  isClearable
                  classNamePrefix="filter-select"
                />
              </div>
              
              {/* Harga Jual Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Harga Jual (Rp)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="input flex-1"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                  <span className="text-gray-400 dark:text-dark-400">—</span>
                  <input
                    type="number"
                    className="input flex-1"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Margin Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Margin (%)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="input flex-1"
                    placeholder="Min"
                    value={filters.minMargin}
                    onChange={(e) => setFilters({ ...filters, minMargin: e.target.value })}
                  />
                  <span className="text-gray-400 dark:text-dark-400">—</span>
                  <input
                    type="number"
                    className="input flex-1"
                    placeholder="Max"
                    value={filters.maxMargin}
                    onChange={(e) => setFilters({ ...filters, maxMargin: e.target.value })}
                  />
                </div>
              </div>
              
              {/* HPP Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">HPP (Rp)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="input flex-1"
                    placeholder="Min"
                    value={filters.minHpp}
                    onChange={(e) => setFilters({ ...filters, minHpp: e.target.value })}
                  />
                  <span className="text-gray-400 dark:text-dark-400">—</span>
                  <input
                    type="number"
                    className="input flex-1"
                    placeholder="Max"
                    value={filters.maxHpp}
                    onChange={(e) => setFilters({ ...filters, maxHpp: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Tanggal Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar size={16} className="text-primary-500" />
                  Tanggal Dibuat
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    className="input flex-1 cursor-pointer"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                  <span className="text-gray-400 dark:text-dark-400 font-medium">s/d</span>
                  <input
                    type="date"
                    className="input flex-1 cursor-pointer"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Active filter summary */}
              {hasActiveFilters && (
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700/50">
                  <p className="text-sm text-primary-700 dark:text-primary-400">
                    <span className="font-semibold">{filteredMenus.length}</span> dari <span className="font-semibold">{menus.length}</span> menu akan ditampilkan
                  </p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50">
              <button 
                className="btn btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  resetFilters();
                }}
                disabled={!hasActiveFilters}
              >
                <RotateCcw size={16} />
                Reset Filter
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowFilterModal(false)}
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredMenus.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-700/50 text-gray-400 dark:text-dark-500 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tidak ada menu</h3>
          <p className="text-gray-500 dark:text-dark-400">
            {searchTerm ? 'Tidak ditemukan menu dengan kata kunci tersebut' : 'Mulai dengan menambahkan menu'}
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* Jumlah Menu */}
            <div className="card p-4">
              <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Jumlah Menu</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredMenus.length}</p>
            </div>
            
            {/* Rata-rata Profit */}
            <div className="card p-4">
              <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Rata-rata Profit</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(filteredMenus.reduce((sum, m) => sum + m.profit, 0) / filteredMenus.length)}
              </p>
            </div>
            
            {/* Top 3 Profit Tertinggi */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-dark-400">Profit Tertinggi</p>
                <TrendingUp size={14} className="text-green-500" />
              </div>
              <div className="space-y-2">
                {[...filteredMenus]
                  .sort((a, b) => {
                    const marginA = a.sellingPrice > 0 ? (a.profit / a.sellingPrice) * 100 : 0;
                    const marginB = b.sellingPrice > 0 ? (b.profit / b.sellingPrice) * 100 : 0;
                    return marginB - marginA;
                  })
                  .slice(0, 3)
                  .map((menu, idx) => {
                    const margin = menu.sellingPrice > 0 ? (menu.profit / menu.sellingPrice) * 100 : 0;
                    return (
                      <div key={menu.id} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{menu.name}</span>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">+{margin.toFixed(1)}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
            
            {/* Top 3 Profit Terendah */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-dark-400">Profit Terendah</p>
                <TrendingDown size={14} className="text-red-500" />
              </div>
              <div className="space-y-2">
                {[...filteredMenus]
                  .sort((a, b) => {
                    const marginA = a.sellingPrice > 0 ? (a.profit / a.sellingPrice) * 100 : 0;
                    const marginB = b.sellingPrice > 0 ? (b.profit / b.sellingPrice) * 100 : 0;
                    return marginA - marginB;
                  })
                  .slice(0, 3)
                  .map((menu, idx) => {
                    const margin = menu.sellingPrice > 0 ? (menu.profit / menu.sellingPrice) * 100 : 0;
                    return (
                      <div key={menu.id} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400">
                          {idx + 1}
                        </div>
                        <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{menu.name}</span>
                        <span className={`text-xs font-medium ${margin >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                          {margin >= 0 ? '+' : ''}{margin.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Menu Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {filteredMenus
              .sort((a, b) => {
                // Calculate profit margin for sorting
                const marginA = a.sellingPrice > 0 ? (a.profit / a.sellingPrice) * 100 : 0;
                const marginB = b.sellingPrice > 0 ? (b.profit / b.sellingPrice) * 100 : 0;
                return marginB - marginA;
              })
              .map((menu, index, sortedArray) => {
                const profitMargin = menu.sellingPrice > 0 ? (menu.profit / menu.sellingPrice) * 100 : 0;
                const isHighProfit = profitMargin >= 50; // Highlight if profit margin >= 50%
                const isBestSeller = index < 3 && profitMargin >= 40; // Top 3 with good margin
                const isLowProfit = index >= sortedArray.length - 3 && sortedArray.length > 3; // Bottom 3 menus (only if more than 3 menus)
                
                return (
                  <div 
                    key={menu.id} 
                    className={`card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative
                      ${isHighProfit ? 'ring-2 ring-emerald-500/50 dark:ring-emerald-400/50' : ''}
                      ${isBestSeller ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-dark-800' : ''}
                      ${isLowProfit ? 'ring-2 ring-red-500/50 dark:ring-red-400/50 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-dark-800' : ''}`}
                    onClick={() => handleCardClick(menu)}
                  >
                    {/* Best Seller Badge */}
                    {isBestSeller && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full shadow-lg flex items-center gap-1">
                          <TrendingUp size={12} />
                          Top Profit
                        </span>
                      </div>
                    )}
                    
                    {/* Low Profit Badge */}
                    {isLowProfit && !isBestSeller && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full shadow-lg flex items-center gap-1">
                          <TrendingDown size={12} />
                          Low Profit
                        </span>
                      </div>
                    )}

                    {/* Image Section */}
                    <div className="relative h-24 md:h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 overflow-hidden">
                      {menu.imageUrl ? (
                        <img 
                          src={menu.imageUrl} 
                          alt={menu.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <UtensilsCrossed size={40} className="text-gray-400 dark:text-dark-500" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {menu.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full shadow">
                            <Check size={12} />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded-full shadow">
                            <XCircle size={12} />
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2 md:p-4">
                      <div className="mb-2 md:mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-xs md:text-lg">
                          {menu.name}
                        </h3>
                        {menu.category && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mt-1">
                            <Tags size={12} />
                            {menu.category.name}
                          </span>
                        )}
                      </div>

                      {/* Price Info */}
                      <div className="space-y-1 md:space-y-2 mb-2 md:mb-3">
                        <div className="flex justify-between items-center text-[10px] md:text-sm">
                          <span className="text-gray-500 dark:text-dark-400">HPP</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(menu.totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] md:text-sm">
                          <span className="text-gray-500 dark:text-dark-400">Harga Jual</span>
                          <span className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(menu.sellingPrice)}</span>
                        </div>
                      </div>

                      {/* Profit Section - Highlighted */}
                      <div className={`p-2 md:p-3 rounded-lg ${
                        menu.profit >= 0 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/50' 
                          : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700/50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] md:text-xs text-gray-500 dark:text-dark-400 mb-0.5">Keuntungan</p>
                            <p className={`text-sm md:text-lg font-bold ${menu.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(menu.profit)}
                            </p>
                          </div>
                          <div className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full ${
                            menu.profit >= 0 
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                              : 'bg-red-500/20 text-red-600 dark:text-red-400'
                          }`}>
                            {menu.profit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          </div>
                        </div>
                        
                        {/* Profit Margin Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500 dark:text-dark-400">Margin</span>
                            <span className={`font-semibold ${profitMargin >= 50 ? 'text-emerald-600 dark:text-emerald-400' : profitMargin >= 30 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {profitMargin.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                profitMargin >= 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 
                                profitMargin >= 30 ? 'bg-gradient-to-r from-green-500 to-lime-400' : 
                                'bg-gradient-to-r from-amber-500 to-yellow-400'
                              }`}
                              style={{ width: `${Math.min(profitMargin, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="hidden md:flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 transition-colors text-sm font-medium"
                          onClick={() => handleOpenModal(menu)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                          onClick={() => handleDelete(menu.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMenu && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header with Image */}
            <div className="relative flex-shrink-0">
              {selectedMenu.imageUrl ? (
                <div className="h-32 md:h-48 w-full overflow-hidden">
                  <img 
                    src={selectedMenu.imageUrl} 
                    alt={selectedMenu.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ) : (
                <div className="h-24 md:h-32 w-full bg-gradient-to-br from-primary-500 to-primary-600" />
              )}
              
              {/* Close button */}
              <button 
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={18} />
              </button>
              
              {/* Status badge */}
              <div className="absolute top-3 left-3">
                {selectedMenu.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full shadow-lg">
                    <Check size={12} />
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded-full shadow-lg">
                    <XCircle size={12} />
                    Nonaktif
                  </span>
                )}
              </div>
              
              {/* Title overlay on image */}
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">{selectedMenu.name}</h2>
                {selectedMenu.category && (
                  <span className="inline-flex items-center gap-1 text-xs md:text-sm text-white/80 mt-1">
                    <Tags size={12} />
                    {selectedMenu.category.name}
                  </span>
                )}
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* Description */}
              {selectedMenu.description && (
                <p className="text-gray-600 dark:text-dark-400 text-xs md:text-sm leading-relaxed">
                  {selectedMenu.description}
                </p>
              )}

              {/* Recipes Used */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍳</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Resep yang Digunakan</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMenu.recipes?.map((mr, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                    >
                      <ChefHat size={14} className="text-primary-500" />
                      {mr.recipe?.name}
                      {mr.quantity > 1 && (
                        <span className="px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full ml-1">
                          ×{mr.quantity}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700/50 dark:to-dark-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💰</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Ringkasan Harga</h4>
                </div>
                
                {/* Price breakdown by recipe */}
                {selectedMenu.recipes?.length > 0 && (
                  <div className="space-y-2 pb-3 border-b border-gray-200 dark:border-dark-600">
                    {selectedMenu.recipes.map((mr, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-dark-400">
                          {mr.recipe?.name} × {mr.quantity || 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {formatCurrency((mr.recipe?.costPerServing || 0) * (mr.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white dark:bg-dark-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Total HPP</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(selectedMenu.totalCost)}</p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-dark-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Harga Jual</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(selectedMenu.sellingPrice)}</p>
                  </div>
                </div>
                
                {/* Profit Section */}
                <div className={`p-4 rounded-lg ${
                  selectedMenu.profit >= 0 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/50' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700/50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Keuntungan</p>
                      <div className="flex items-center gap-2">
                        {selectedMenu.profit >= 0 ? (
                          <TrendingUp size={20} className="text-green-500" />
                        ) : (
                          <TrendingDown size={20} className="text-red-500" />
                        )}
                        <p className={`text-2xl font-bold ${selectedMenu.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(selectedMenu.profit)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                      (selectedMenu.profitMargin || 0) >= 50 ? 'bg-emerald-500 text-white' : 
                      (selectedMenu.profitMargin || 0) >= 30 ? 'bg-green-500 text-white' : 
                      (selectedMenu.profitMargin || 0) >= 0 ? 'bg-amber-500 text-white' : 
                      'bg-red-500 text-white'
                    }`}>
                      {(selectedMenu.profitMargin || 0).toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Margin Bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          (selectedMenu.profitMargin || 0) >= 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 
                          (selectedMenu.profitMargin || 0) >= 30 ? 'bg-gradient-to-r from-green-500 to-lime-400' : 
                          (selectedMenu.profitMargin || 0) >= 0 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-rose-400'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(selectedMenu.profitMargin || 0, 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700 flex gap-3">
              <button 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium transition-colors"
                onClick={() => handleDelete(selectedMenu.id)}
              >
                <Trash2 size={16} />
                Hapus
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                onClick={() => handleOpenModal(selectedMenu)}
              >
                <Pencil size={16} />
                Edit Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center">
                  <UtensilsCrossed size={18} />
                </div>
                <div>
                  <h2 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white">
                    {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-dark-400">
                    {editingMenu ? 'Perbarui informasi menu' : 'Buat menu dari resep yang ada'}
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="modal-body space-y-4 md:space-y-6 flex-1 overflow-y-auto">
                
                {/* Section: Informasi Dasar */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-700">
                    <span className="text-lg">📋</span>
                    <h3 className="font-medium text-gray-900 dark:text-white">Informasi Dasar</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                        Nama Menu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Contoh: Paket Ayam Geprek Komplit"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                        <Tags size={14} className="inline mr-1" />
                        Kategori Menu
                      </label>
                      <CreatableSelect
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === formData.categoryId) || null}
                        onChange={(selected) => setFormData({ ...formData, categoryId: selected?.value || '' })}
                        onCreateOption={handleCreateCategory}
                        styles={selectStyles}
                        placeholder="Pilih kategori..."
                        isClearable
                        isLoading={isCreatingCategory}
                        isDisabled={isCreatingCategory}
                        formatCreateLabel={(inputValue) => `➕ Buat "${inputValue}"`}
                        noOptionsMessage={() => "Ketik untuk buat baru"}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                        Gambar Menu
                      </label>
                      
                      {/* Tab Selector */}
                      <div className="flex rounded-lg bg-gray-100 dark:bg-dark-700 p-1">
                        <button
                          type="button"
                          onClick={() => { setImageMode('url'); setImageError(''); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                            imageMode === 'url' 
                              ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <Link size={14} />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => { setImageMode('upload'); setImageError(''); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                            imageMode === 'upload' 
                              ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm' 
                              : 'text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <Upload size={14} />
                          Upload
                        </button>
                      </div>

                      {/* URL Input */}
                      {imageMode === 'url' && (
                        <input
                          type="url"
                          className="input text-sm"
                          placeholder="https://example.com/image.jpg"
                          value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, imageUrl: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                        />
                      )}

                      {/* Upload Area */}
                      {imageMode === 'upload' && (
                        <div className="space-y-2">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors bg-gray-50 dark:bg-dark-700/50">
                            <div className="flex flex-col items-center justify-center py-4">
                              {isUploadingImage ? (
                                <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
                              ) : (
                                <>
                                  <Upload size={20} className="text-gray-400 dark:text-dark-500 mb-1" />
                                  <p className="text-xs text-gray-500 dark:text-dark-400">
                                    Klik untuk upload
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-dark-500">
                                    JPG, PNG (max 10MB, min 300x300px)
                                  </p>
                                </>
                              )}
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".jpg,.jpeg,.png"
                              onChange={handleImageUpload}
                              disabled={isUploadingImage}
                            />
                          </label>
                        </div>
                      )}

                      {/* Error Message */}
                      {imageError && (
                        <div className="flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircle size={14} />
                          {imageError}
                        </div>
                      )}

                      {/* Image Preview */}
                      {(formData.imageUrl || imagePreview) && (
                        <div className="relative inline-block">
                          <img 
                            src={formData.imageUrl || imagePreview} 
                            alt="Preview" 
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-dark-600"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                      Deskripsi
                    </label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="Deskripsi singkat menu..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Section: Resep yang Digunakan */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-700">
                    <span className="text-lg">🍳</span>
                    <h3 className="font-medium text-gray-900 dark:text-white">Resep yang Digunakan</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.recipes.map((r, index) => {
                      const selectedRecipe = recipes.find(rec => rec.id.toString() === r.recipeId);
                      return (
                        <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                          <div className="flex-1 space-y-2">
                            <select
                              className="input text-sm"
                              value={r.recipeId}
                              onChange={(e) => handleRecipeChange(index, 'recipeId', e.target.value)}
                            >
                              <option value="">Pilih resep...</option>
                              {recipes.map(recipe => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.name} (HPP: {formatCurrency(recipe.costPerServing)}/porsi)
                                </option>
                              ))}
                            </select>
                            {selectedRecipe && (
                              <p className="text-xs text-primary-600 dark:text-primary-400">
                                HPP: {formatCurrency(selectedRecipe.costPerServing)} × {r.quantity || 1} = {formatCurrency(selectedRecipe.costPerServing * (Number(r.quantity) || 1))}
                              </p>
                            )}
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              className="input text-sm text-center"
                              placeholder="Qty"
                              value={r.quantity}
                              onChange={(e) => handleRecipeChange(index, 'quantity', e.target.value)}
                              min="1"
                            />
                          </div>
                          {formData.recipes.length > 1 && (
                            <button
                              type="button"
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              onClick={() => handleRemoveRecipe(index)}
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg text-gray-600 dark:text-dark-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      onClick={handleAddRecipe}
                    >
                      <Plus size={18} />
                      Tambah Resep
                    </button>
                  </div>
                </div>

                {/* Section: Harga & Keuntungan */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-700">
                    <span className="text-lg">💰</span>
                    <h3 className="font-medium text-gray-900 dark:text-white">Harga & Keuntungan</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                      Harga Jual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-400 text-sm font-medium">Rp</span>
                      <input
                        type="number"
                        className="input pl-10"
                        placeholder="20000"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Profit Preview */}
                  {previewCost > 0 && formData.sellingPrice && (
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700/50 dark:to-dark-700 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span>📊</span>
                        <span>Kalkulasi Keuntungan</span>
                      </div>
                      
                      {/* Recipe breakdown */}
                      <div className="space-y-1">
                        {formData.recipes.filter(r => r.recipeId).map((r, idx) => {
                          const recipe = recipes.find(rec => rec.id.toString() === r.recipeId);
                          if (!recipe) return null;
                          const subtotal = recipe.costPerServing * (Number(r.quantity) || 1);
                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-dark-400">{recipe.name} × {r.quantity || 1}</span>
                              <span className="text-gray-700 dark:text-gray-300">{formatCurrency(subtotal)}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="h-px bg-gray-200 dark:bg-dark-600" />
                      
                      {/* Summary */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white dark:bg-dark-800 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Total HPP</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(previewCost)}</p>
                        </div>
                        <div className="p-3 bg-white dark:bg-dark-800 rounded-lg text-center">
                          <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Harga Jual</p>
                          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(parseFloat(formData.sellingPrice) || 0)}</p>
                        </div>
                      </div>
                      
                      {/* Profit & Margin */}
                      <div className={`p-4 rounded-lg ${previewProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Keuntungan</p>
                            <p className={`text-2xl font-bold ${previewProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(previewProfit)}
                            </p>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                            previewMargin >= 50 ? 'bg-emerald-500 text-white' : 
                            previewMargin >= 30 ? 'bg-green-500 text-white' : 
                            previewMargin >= 0 ? 'bg-amber-500 text-white' : 
                            'bg-red-500 text-white'
                          }`}>
                            {previewMargin.toFixed(1)}%
                          </div>
                        </div>
                        
                        {/* Margin Bar */}
                        <div className="mt-3">
                          <div className="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                previewMargin >= 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 
                                previewMargin >= 30 ? 'bg-gradient-to-r from-green-500 to-lime-400' : 
                                previewMargin >= 0 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                'bg-gradient-to-r from-red-500 to-rose-400'
                              }`}
                              style={{ width: `${Math.max(0, Math.min(previewMargin, 100))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-dark-600 text-gray-500 dark:text-dark-400'}`}>
                      {formData.isActive ? <Check size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Menu Aktif</p>
                      <p className="text-sm text-gray-500 dark:text-dark-400">Tampilkan menu untuk dijual</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 dark:bg-dark-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
              
              <div className="modal-footer flex-shrink-0">
                <button type="button" className="btn btn-secondary text-sm" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary text-sm">
                  {editingMenu ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menus;
