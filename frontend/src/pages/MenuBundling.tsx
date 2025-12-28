import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Package, X, Gift, Percent, Tag, DollarSign, Calculator, TrendingUp, Calendar, Clock, Check, XCircle, Sparkles, ShoppingBag, BadgePercent, Zap } from 'lucide-react';
import Select from 'react-select';
import { bundlingApi, menusApi } from '../api';
import { PageSkeleton } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

// Promotion type configurations
const PROMOTION_TYPES = [
  { 
    value: 'BUY1GET1', 
    label: 'Buy 1 Get 1', 
    icon: Gift, 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    textColor: 'text-pink-600 dark:text-pink-400',
    description: 'Beli 1 gratis 1'
  },
  { 
    value: 'BUY2GET1', 
    label: 'Buy 2 Get 1', 
    icon: ShoppingBag, 
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400',
    description: 'Beli 2 gratis 1'
  },
  { 
    value: 'PERCENTAGE', 
    label: 'Diskon %', 
    icon: BadgePercent, 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    description: 'Diskon persentase'
  },
  { 
    value: 'DISCOUNT', 
    label: 'Diskon Nominal', 
    icon: Tag, 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
    description: 'Potongan harga tetap'
  },
  { 
    value: 'FIXED_PRICE', 
    label: 'Harga Paket', 
    icon: Zap, 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    description: 'Harga bundling tetap'
  }
];

function MenuBundling() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Toast & Confirm dialog states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; bundleId: number | null; bundleName: string }>({ 
    show: false, bundleId: null, bundleName: '' 
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promotionType: 'PERCENTAGE',
    discountValue: '',
    bundlePrice: '',
    isActive: true,
    validFrom: '',
    validUntil: '',
    items: [{ menuId: '', quantity: 1, isFree: false }]
  });

  useEffect(() => {
    loadData();
  }, []);

  // Auto-calculate when items or promotion type changes
  useEffect(() => {
    const validItems = formData.items.filter(item => item.menuId);
    if (validItems.length > 0) {
      calculateBundle();
    } else {
      setCalculation(null);
    }
  }, [formData.items, formData.promotionType, formData.discountValue, formData.bundlePrice]);

  const loadData = async () => {
    try {
      const [bundlesRes, menusRes] = await Promise.all([
        bundlingApi.getAll(),
        menusApi.getAll()
      ]);
      setBundles(bundlesRes.data);
      setMenus(menusRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      setToast({ message: 'Gagal memuat data bundling', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateBundle = async () => {
    const validItems = formData.items.filter(item => item.menuId);
    if (validItems.length === 0) return;
    
    setIsCalculating(true);
    try {
      const res = await bundlingApi.calculate({
        items: validItems,
        promotionType: formData.promotionType,
        discountValue: formData.discountValue ? parseFloat(formData.discountValue) : undefined,
        bundlePrice: formData.bundlePrice ? parseFloat(formData.bundlePrice) : undefined
      });
      setCalculation(res.data);
    } catch (error) {
      console.error('Failed to calculate:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (value: number) => {
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

  const menuOptions = menus.map(menu => ({
    value: menu.id.toString(),
    label: `${menu.name} - ${formatCurrency(menu.sellingPrice)}`,
    menu
  }));

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { menuId: '', quantity: 1, isFree: false }]
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleOpenModal = (bundle: any = null) => {
    if (bundle) {
      setEditingBundle(bundle);
      setFormData({
        name: bundle.name,
        description: bundle.description || '',
        promotionType: bundle.promotionType,
        discountValue: bundle.discountValue?.toString() || '',
        bundlePrice: bundle.bundlePrice?.toString() || '',
        isActive: bundle.isActive,
        validFrom: bundle.validFrom ? bundle.validFrom.split('T')[0] : '',
        validUntil: bundle.validUntil ? bundle.validUntil.split('T')[0] : '',
        items: bundle.items.map((item: any) => ({
          menuId: item.menuId.toString(),
          quantity: item.quantity,
          isFree: item.isFree
        }))
      });
    } else {
      setEditingBundle(null);
      setFormData({
        name: '',
        description: '',
        promotionType: 'PERCENTAGE',
        discountValue: '',
        bundlePrice: '',
        isActive: true,
        validFrom: '',
        validUntil: '',
        items: [{ menuId: '', quantity: 1, isFree: false }]
      });
    }
    setShowDetailModal(false);
    setShowModal(true);
    setCalculation(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBundle(null);
    setCalculation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setToast({ message: 'Nama bundle wajib diisi!', type: 'error' });
      return;
    }

    const validItems = formData.items.filter(item => item.menuId);
    if (validItems.length === 0) {
      setToast({ message: 'Tambahkan minimal satu menu!', type: 'error' });
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        items: validItems
      };

      if (editingBundle) {
        await bundlingApi.update(editingBundle.id, dataToSubmit);
        setToast({ message: 'Bundle berhasil diperbarui!', type: 'success' });
      } else {
        await bundlingApi.create(dataToSubmit);
        setToast({ message: 'Bundle baru berhasil dibuat!', type: 'success' });
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      console.error('Failed to save bundle:', error);
      setToast({ message: 'Gagal menyimpan bundle', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.bundleId) return;
    
    try {
      await bundlingApi.delete(confirmDialog.bundleId);
      setToast({ message: 'Bundle berhasil dihapus!', type: 'success' });
      setShowDetailModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to delete bundle:', error);
      setToast({ message: 'Gagal menghapus bundle', type: 'error' });
    } finally {
      setConfirmDialog({ show: false, bundleId: null, bundleName: '' });
    }
  };

  const handleCardClick = async (bundle: any) => {
    try {
      const res = await bundlingApi.getById(bundle.id);
      setSelectedBundle(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to load bundle detail:', error);
    }
  };

  const getPromotionType = (type: string) => {
    return PROMOTION_TYPES.find(pt => pt.value === type) || PROMOTION_TYPES[0];
  };

  const filteredBundles = bundles.filter(bundle =>
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <PageSkeleton type="cards" />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title="Hapus Bundle"
        message={`Yakin ingin menghapus bundle "${confirmDialog.bundleName}"?`}
        confirmText="Hapus"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ show: false, bundleId: null, bundleName: '' })}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          Perencanaan Promo
        </h1>
        <p className="text-gray-500 dark:text-dark-400">
          Buat paket promosi menarik dengan menggabungkan beberapa menu dan analisis HPP
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Cari bundle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary flex-1 sm:flex-none" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Buat Promo
        </button>
      </div>

      {/* Promotion Type Legend */}
      <div className="flex flex-wrap gap-2">
        {PROMOTION_TYPES.map((type) => (
          <div 
            key={type.value}
            className={`px-3 py-1.5 rounded-full ${type.bgColor} flex items-center gap-2`}
          >
            <type.icon size={14} className={type.textColor} />
            <span className={`text-xs font-medium ${type.textColor}`}>{type.label}</span>
          </div>
        ))}
      </div>

      {filteredBundles.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-700/50 text-gray-400 dark:text-dark-500 flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Belum ada bundle</h3>
          <p className="text-gray-500 dark:text-dark-400 mb-4">
            {searchTerm ? 'Tidak ditemukan bundle dengan kata kunci tersebut' : 'Mulai dengan membuat promosi pertama'}
          </p>
          {!searchTerm && (
            <button className="btn btn-primary mx-auto" onClick={() => handleOpenModal()}>
              <Plus size={18} />
              Buat Promo Pertama
            </button>
          )}
        </div>
      ) : (
        /* Bundle Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBundles.map((bundle) => {
            const promoType = getPromotionType(bundle.promotionType);
            const isActive = bundle.isActive;
            const isExpired = bundle.validUntil && new Date(bundle.validUntil) < new Date();

            return (
              <div
                key={bundle.id}
                className={`card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  !isActive || isExpired ? 'opacity-60' : ''
                }`}
                onClick={() => handleCardClick(bundle)}
              >
                {/* Header with Promotion Badge */}
                <div className={`bg-gradient-to-r ${promoType.color} p-4 relative`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <promoType.icon size={20} className="text-white" />
                      <span className="text-white font-semibold text-sm">{promoType.label}</span>
                    </div>
                    {isExpired ? (
                      <span className="px-2 py-1 bg-black/30 text-white text-xs rounded-full">Kadaluarsa</span>
                    ) : !isActive ? (
                      <span className="px-2 py-1 bg-black/30 text-white text-xs rounded-full">Nonaktif</span>
                    ) : (
                      <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">Aktif</span>
                    )}
                  </div>
                  
                  {/* Discount Display */}
                  <div className="mt-3">
                    {bundle.promotionType === 'PERCENTAGE' && bundle.discountValue && (
                      <span className="text-3xl font-bold text-white">{bundle.discountValue}% OFF</span>
                    )}
                    {bundle.promotionType === 'DISCOUNT' && bundle.discountValue && (
                      <span className="text-2xl font-bold text-white">Hemat {formatCurrency(bundle.discountValue)}</span>
                    )}
                    {bundle.promotionType === 'FIXED_PRICE' && bundle.bundlePrice && (
                      <span className="text-2xl font-bold text-white">Hanya {formatCurrency(bundle.bundlePrice)}</span>
                    )}
                    {bundle.promotionType === 'BUY1GET1' && (
                      <span className="text-2xl font-bold text-white">GRATIS 1!</span>
                    )}
                    {bundle.promotionType === 'BUY2GET1' && (
                      <span className="text-2xl font-bold text-white">GRATIS 1!</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{bundle.name}</h3>
                  
                  {bundle.description && (
                    <p className="text-sm text-gray-500 dark:text-dark-400 mb-3 line-clamp-2">{bundle.description}</p>
                  )}

                  {/* Items Preview */}
                  <div className="space-y-1 mb-4">
                    {bundle.items?.slice(0, 3).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                          item.isFree 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
                        }`}>
                          {item.isFree ? <Gift size={12} /> : item.quantity}
                        </span>
                        <span className={`flex-1 truncate ${
                          item.isFree ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-dark-400'
                        }`}>
                          {item.menu?.name || 'Menu'}
                          {item.isFree && ' (GRATIS)'}
                        </span>
                      </div>
                    ))}
                    {bundle.items?.length > 3 && (
                      <span className="text-xs text-gray-400 dark:text-dark-500">
                        +{bundle.items.length - 3} menu lainnya
                      </span>
                    )}
                  </div>

                  {/* Price Info */}
                  <div className="border-t border-gray-100 dark:border-dark-700 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-dark-400">HPP Total</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(bundle.totalHPP || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-dark-400">Harga Bundle</span>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(bundle.finalPrice || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-dark-400">Profit</span>
                      <span className={`text-sm font-bold ${
                        (bundle.profit || 0) >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(bundle.profit || 0)} ({(bundle.profitMargin || 0).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBundle && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={`bg-gradient-to-r ${getPromotionType(selectedBundle.promotionType).color} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getPromotionType(selectedBundle.promotionType).icon;
                    return <Icon size={24} className="text-white" />;
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedBundle.name}</h2>
                    <p className="text-white/80 text-sm">{getPromotionType(selectedBundle.promotionType).label}</p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Description */}
              {selectedBundle.description && (
                <p className="text-gray-600 dark:text-dark-400">{selectedBundle.description}</p>
              )}

              {/* Status & Validity */}
              <div className="flex flex-wrap gap-3">
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${
                  selectedBundle.isActive 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
                }`}>
                  {selectedBundle.isActive ? <Check size={14} /> : <XCircle size={14} />}
                  <span className="text-sm font-medium">{selectedBundle.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                {selectedBundle.validFrom && (
                  <div className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Calendar size={14} />
                    <span className="text-sm">
                      {new Date(selectedBundle.validFrom).toLocaleDateString('id-ID')} 
                      {selectedBundle.validUntil && ` - ${new Date(selectedBundle.validUntil).toLocaleDateString('id-ID')}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Menu dalam Bundle</h3>
                <div className="space-y-2">
                  {selectedBundle.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          item.isFree 
                            ? 'bg-green-500 text-white' 
                            : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        }`}>
                          {item.isFree ? <Gift size={14} /> : item.quantity}
                        </span>
                        <div>
                          <p className={`font-medium ${
                            item.isFree ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.menu?.name} {item.isFree && '(GRATIS!)'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-dark-400">
                            HPP: {formatCurrency(item.hpp || 0)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {item.isFree ? 'FREE' : formatCurrency(item.subtotalPrice || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-400">Harga Normal</span>
                  <span className="text-gray-900 dark:text-white line-through">
                    {formatCurrency(selectedBundle.originalPrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-400">Diskon</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    - {formatCurrency(selectedBundle.discount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-dark-600 pt-3">
                  <span className="font-semibold text-gray-900 dark:text-white">Harga Bundle</span>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(selectedBundle.finalPrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-400">Total HPP</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(selectedBundle.totalHPP || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-400">Profit</span>
                  <span className={`font-bold ${
                    (selectedBundle.profit || 0) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(selectedBundle.profit || 0)} ({(selectedBundle.profitMargin || 0).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Suggested Prices */}
              {selectedBundle.suggestedPrices && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Rekomendasi Harga Ideal
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedBundle.suggestedPrices.map((sp: any) => (
                      <div 
                        key={sp.margin} 
                        className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-700/50"
                      >
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Margin {sp.margin}%</p>
                        <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{formatCurrency(sp.price)}</p>
                        <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Profit: {formatCurrency(sp.profit)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50">
              <button
                className="btn btn-ghost text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => setConfirmDialog({ 
                  show: true, 
                  bundleId: selectedBundle.id, 
                  bundleName: selectedBundle.name 
                })}
              >
                <Trash2 size={18} />
                Hapus
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleOpenModal(selectedBundle)}
              >
                <Pencil size={18} />
                Edit Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={20} className="text-primary-500" />
                  {editingBundle ? 'Edit Promo' : 'Buat Promo Baru'}
                </h3>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 flex items-center justify-center text-gray-500 dark:text-dark-400 transition-colors"
                  onClick={handleCloseModal}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nama Bundle <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="misal: Paket Hemat Makan Siang"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                      <textarea
                        className="input min-h-[80px]"
                        placeholder="Deskripsi singkat bundle..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Promotion Type Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tipe Promosi <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PROMOTION_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            className={`p-3 rounded-xl border-2 transition-all ${
                              formData.promotionType === type.value
                                ? `border-primary-500 bg-gradient-to-r ${type.color} text-white`
                                : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'
                            }`}
                            onClick={() => setFormData({ ...formData, promotionType: type.value })}
                          >
                            <type.icon size={20} className={formData.promotionType === type.value ? 'text-white' : type.textColor} />
                            <p className={`text-xs font-medium mt-1 ${
                              formData.promotionType === type.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {type.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Discount Value (for PERCENTAGE, DISCOUNT) */}
                    {(formData.promotionType === 'PERCENTAGE' || formData.promotionType === 'DISCOUNT') && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formData.promotionType === 'PERCENTAGE' ? 'Persentase Diskon (%)' : 'Nominal Diskon (Rp)'}
                        </label>
                        <input
                          type="number"
                          className="input"
                          placeholder={formData.promotionType === 'PERCENTAGE' ? 'misal: 20' : 'misal: 10000'}
                          value={formData.discountValue}
                          onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                          min="0"
                          max={formData.promotionType === 'PERCENTAGE' ? '100' : undefined}
                        />
                      </div>
                    )}

                    {/* Bundle Price (for FIXED_PRICE) */}
                    {formData.promotionType === 'FIXED_PRICE' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Harga Paket (Rp)
                        </label>
                        <input
                          type="number"
                          className="input"
                          placeholder="misal: 50000"
                          value={formData.bundlePrice}
                          onChange={(e) => setFormData({ ...formData, bundlePrice: e.target.value })}
                          min="0"
                        />
                      </div>
                    )}

                    {/* Validity Period */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Calendar size={14} />
                          Berlaku Dari
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={formData.validFrom}
                          onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Clock size={14} />
                          Sampai
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={formData.validUntil}
                          onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Status Aktif</p>
                        <p className="text-sm text-gray-500 dark:text-dark-400">Bundle dapat digunakan</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Right Column - Menu Items & Calculator */}
                  <div className="space-y-4">
                    {/* Menu Items */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Menu dalam Bundle <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                          onClick={handleAddItem}
                        >
                          <Plus size={14} />
                          Tambah Menu
                        </button>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {formData.items.map((item, index) => (
                          <div 
                            key={index} 
                            className={`p-3 rounded-xl border ${
                              item.isFree 
                                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50'
                            }`}
                          >
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Select
                                  options={menuOptions}
                                  value={menuOptions.find(opt => opt.value === item.menuId) || null}
                                  onChange={(option) => handleItemChange(index, 'menuId', option?.value || '')}
                                  styles={selectStyles}
                                  placeholder="Pilih menu..."
                                  isClearable
                                />
                              </div>
                              <input
                                type="number"
                                className="input w-20"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                min="1"
                              />
                              {formData.items.length > 1 && (
                                <button
                                  type="button"
                                  className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            {/* Free Item Toggle (for BOGO promotions) */}
                            {(formData.promotionType === 'BUY1GET1' || formData.promotionType === 'BUY2GET1') && (
                              <div className="mt-2 flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                                    checked={item.isFree}
                                    onChange={(e) => handleItemChange(index, 'isFree', e.target.checked)}
                                  />
                                  <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                    <Gift size={14} />
                                    Item GRATIS
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Calculator */}
                    {calculation && (
                      <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <Calculator size={18} />
                          <span className="font-semibold">Kalkulasi Langsung</span>
                          {isCalculating && (
                            <span className="text-xs animate-pulse">Menghitung...</span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-dark-400">Harga Normal</span>
                            <span className="text-gray-900 dark:text-white line-through">
                              {formatCurrency(calculation.originalPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-dark-400">Diskon</span>
                            <span className="text-green-600 dark:text-green-400">
                              - {formatCurrency(calculation.discount)}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-base border-t border-blue-200 dark:border-blue-700/50 pt-2">
                            <span className="text-gray-900 dark:text-white">Harga Bundle</span>
                            <span className="text-primary-600 dark:text-primary-400">
                              {formatCurrency(calculation.finalPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-dark-400">Total HPP</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(calculation.totalHPP)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-600 dark:text-dark-400">Profit</span>
                            <span className={calculation.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {formatCurrency(calculation.profit)} ({calculation.profitMargin.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {/* Suggested Prices */}
                        {calculation.suggestedPrices && (
                          <div className="pt-3 border-t border-blue-200 dark:border-blue-700/50">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
                              <Sparkles size={12} />
                              Rekomendasi Harga
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {calculation.suggestedPrices.slice(0, 4).map((sp: any) => (
                                <button
                                  key={sp.margin}
                                  type="button"
                                  className="px-2 py-1 text-xs bg-white dark:bg-dark-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border border-amber-200 dark:border-amber-700/50"
                                  onClick={() => setFormData({ 
                                    ...formData, 
                                    promotionType: 'FIXED_PRICE', 
                                    bundlePrice: sp.price.toString() 
                                  })}
                                  title={`Profit: ${formatCurrency(sp.profit)}`}
                                >
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">{sp.margin}%</span>
                                  <span className="text-gray-500 dark:text-dark-400 ml-1">{formatCurrency(sp.price)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBundle ? 'Simpan Perubahan' : 'Buat Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuBundling;
