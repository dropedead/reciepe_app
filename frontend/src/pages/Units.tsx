import { useState, useEffect } from 'react';
import { Scale, X, RefreshCw, Check, ShoppingCart, ChefHat, Plus, Pencil, Trash2, Search, Droplets, Layers, Info, Filter } from 'lucide-react';
import { unitMasterApi } from '../api';
import { PageSkeleton } from '../components/Skeleton';

interface Unit {
    id: number;
    name: string;
    label: string;
    group: string;
    baseValue: number;
    isBaseUnit: boolean;
    isPurchaseUnit: boolean;
    isUsageUnit: boolean;
    description: string | null;
}

const GROUP_LABELS: { [key: string]: string } = {
    mass: 'Berat/Massa',
    volume: 'Volume',
    count: 'Hitungan/Satuan'
};

const GROUP_COLORS: { [key: string]: string } = {
    mass: '#10b981',
    volume: '#3b82f6',
    count: '#f59e0b'
};

function Units() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        label: '',
        group: 'mass',
        baseValue: 1,
        isBaseUnit: false,
        isPurchaseUnit: true,
        isUsageUnit: true,
        description: ''
    });
    const [error, setError] = useState('');
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        try {
            const res = await unitMasterApi.getAll();
            setUnits(res.data);
        } catch (error) {
            console.error('Failed to load units:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeedDefaults = async () => {
        if (units.length > 0) {
            if (!window.confirm('Data satuan sudah ada. Apakah ingin melanjutkan seed default?')) {
                return;
            }
        }
        
        setSeeding(true);
        try {
            await unitMasterApi.seedDefaults();
            await loadUnits();
        } catch (error) {
            console.error('Failed to seed defaults:', error);
            alert('Gagal membuat satuan default');
        } finally {
            setSeeding(false);
        }
    };

    const handleOpenModal = (unit: Unit | null = null) => {
        setError('');
        if (unit) {
            setEditingUnit(unit);
            setFormData({
                name: unit.name,
                label: unit.label,
                group: unit.group,
                baseValue: unit.baseValue,
                isBaseUnit: unit.isBaseUnit,
                isPurchaseUnit: unit.isPurchaseUnit,
                isUsageUnit: unit.isUsageUnit,
                description: unit.description || ''
            });
        } else {
            setEditingUnit(null);
            setFormData({
                name: '',
                label: '',
                group: 'mass',
                baseValue: 1,
                isBaseUnit: false,
                isPurchaseUnit: true,
                isUsageUnit: true,
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUnit(null);
        setFormData({
            name: '',
            label: '',
            group: 'mass',
            baseValue: 1,
            isBaseUnit: false,
            isPurchaseUnit: true,
            isUsageUnit: true,
            description: ''
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingUnit) {
                await unitMasterApi.update(editingUnit.id, formData);
            } else {
                await unitMasterApi.create(formData);
            }
            handleCloseModal();
            loadUnits();
        } catch (error: any) {
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Gagal menyimpan satuan');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Yakin ingin menghapus satuan ini?')) {
            try {
                await unitMasterApi.delete(id);
                loadUnits();
            } catch (error: any) {
                if (error.response?.data?.error) {
                    alert(error.response.data.error);
                } else {
                    alert('Gagal menghapus satuan');
                }
            }
        }
    };

    const filteredUnits = units.filter(unit => {
        const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.label.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || unit.group === activeTab;
        return matchesSearch && matchesTab;
    });

    const stats = {
        total: units.length,
        base: units.filter(u => u.isBaseUnit).length,
        purchase: units.filter(u => u.isPurchaseUnit).length,
        usage: units.filter(u => u.isUsageUnit).length,
        mass: units.filter(u => u.group === 'mass').length,
        volume: units.filter(u => u.group === 'volume').length,
        count: units.filter(u => u.group === 'count').length
    };

    if (loading) {
        return <PageSkeleton type="table" />;
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Scale className="text-primary-500" />
                        Master Satuan
                    </h1>
                    <p className="text-gray-500 dark:text-dark-400">
                        Kelola standar satuan untuk akurasi konversi stok dan kalkulasi HPP.
                    </p>
                </div>
                <div className="flex gap-2">
                    {units.length === 0 && (
                        <button 
                            className="btn btn-secondary" 
                            onClick={handleSeedDefaults}
                            disabled={seeding}
                        >
                            <RefreshCw size={18} className={seeding ? 'animate-spin' : ''} />
                            Seed Default
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        Tambah Satuan
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Satuan', value: stats.total, icon: Scale, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                    { label: 'Satuan Dasar', value: stats.base, icon: Info, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                    { label: 'Pembelian', value: stats.purchase, icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Pemakaian', value: stats.usage, icon: ChefHat, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                ].map((s, i) => (
                    <div key={i} className="card p-4 border border-gray-100 dark:border-dark-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                <s.icon size={20} className={s.color} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">{s.label}</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="card border border-gray-100 dark:border-dark-700 shadow-sm overflow-visible">
                {/* Control Bar */}
                <div className="p-4 border-b border-gray-100 dark:border-dark-700 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100 dark:bg-dark-900 rounded-xl w-fit">
                            {[
                                { id: 'all', label: 'Semua', count: stats.total },
                                { id: 'mass', label: 'Berat', count: stats.mass, icon: Scale },
                                { id: 'volume', label: 'Volume', count: stats.volume, icon: Droplets },
                                { id: 'count', label: 'Hitungan', count: stats.count, icon: Layers },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${activeTab === tab.id 
                                            ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                                            : 'text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-dark-700/50'}
                                    `}
                                >
                                    {tab.icon && <tab.icon size={16} />}
                                    <span>{tab.label}</span>
                                    <span className={`
                                        text-[10px] px-1.5 py-0.5 rounded-full
                                        ${activeTab === tab.id ? 'bg-primary-50 dark:bg-primary-500/10' : 'bg-gray-200 dark:bg-dark-800'}
                                    `}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full lg:max-w-xs">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="input pl-10 h-10 text-sm"
                                placeholder="Cari nama atau simbol..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table / List */}
                <div className="overflow-x-auto">
                    {filteredUnits.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter size={32} className="text-gray-300 dark:text-dark-700" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tidak ada satuan</h3>
                            <p className="text-gray-500 dark:text-dark-400 max-w-sm mx-auto mt-2">
                                {searchTerm 
                                    ? `Pencarian "${searchTerm}" tidak ditemukan di tab ini.` 
                                    : 'Mulai dengan menambahkan satuan baru atau gunakan satuan default.'}
                            </p>
                            {units.length === 0 && !searchTerm && (
                                <button 
                                    className="btn btn-primary mt-6" 
                                    onClick={handleSeedDefaults}
                                    disabled={seeding}
                                >
                                    <RefreshCw size={18} className={seeding ? 'animate-spin' : ''} />
                                    Seed Satuan Default
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="hidden lg:block">
                                <table className="table w-full table-fixed border-none">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-dark-900/50 border-none uppercase tracking-wider text-[10px] font-bold">
                                            <th className="px-6 py-4 text-left">Satuan</th>
                                            <th className="px-6 py-4 text-center w-[160px]">Grup</th>
                                            <th className="px-6 py-4 text-center w-[160px]">Nilai Konversi</th>
                                            <th className="px-6 py-4 text-center w-[130px]">Tipe</th>
                                            <th className="px-6 py-4 text-center w-[110px]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-dark-700/50">
                                        {filteredUnits.map((unit) => (
                                            <tr key={unit.id} className="group hover:bg-gray-50/50 dark:hover:bg-dark-700/20 transition-colors">
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex flex-col truncate">
                                                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                                                            <span className="truncate" title={unit.label}>{unit.label}</span>
                                                            {unit.isBaseUnit && (
                                                                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-500/20">
                                                                    BASE
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-mono tracking-tight truncate">{unit.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex justify-center">
                                                        <span className={`
                                                            inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border
                                                            ${unit.group === 'mass' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : ''}
                                                            ${unit.group === 'volume' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : ''}
                                                            ${unit.group === 'count' ? 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' : ''}
                                                        `}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${unit.group === 'mass' ? 'bg-emerald-500' : unit.group === 'volume' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                                                            <span className="capitalize">{GROUP_LABELS[unit.group] || unit.group}</span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center justify-center font-mono text-sm gap-2 bg-gray-50 dark:bg-dark-800 py-1.5 px-3 rounded-lg border border-gray-100 dark:border-dark-700 w-fit mx-auto">
                                                        <span className="font-bold text-gray-700 dark:text-dark-200">
                                                            {unit.baseValue}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">
                                                            {unit.group === 'mass' ? 'gram' : unit.group === 'volume' ? 'ml' : 'pcs'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                                            unit.isPurchaseUnit 
                                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
                                                                : 'bg-transparent border-transparent text-gray-200 dark:text-dark-700/30'
                                                        }`}>
                                                            <ShoppingCart size={14} className={!unit.isPurchaseUnit ? 'opacity-20' : ''} />
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                                            unit.isUsageUnit 
                                                                ? 'bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400' 
                                                                : 'bg-transparent border-transparent text-gray-200 dark:text-dark-700/30'
                                                        }`}>
                                                            <ChefHat size={14} className={!unit.isUsageUnit ? 'opacity-20' : ''} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center align-middle">
                                                    <div className="flex justify-center gap-1">
                                                        <button 
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                                                            onClick={() => handleOpenModal(unit)}
                                                            title="Edit Satuan"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button 
                                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                            onClick={() => handleDelete(unit.id)}
                                                            title="Hapus Satuan"
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

                            {/* Mobile View */}
                            <div className="lg:hidden p-4 space-y-4">
                                {filteredUnits.map((unit) => (
                                    <div key={unit.id} className="card p-4 border border-gray-100 dark:border-dark-700 shadow-sm flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-10 h-10 rounded-xl flex items-center justify-center
                                                    ${unit.group === 'mass' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : ''}
                                                    ${unit.group === 'volume' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : ''}
                                                    ${unit.group === 'count' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' : ''}
                                                `}>
                                                    {unit.group === 'mass' ? <Scale size={20} /> : unit.group === 'volume' ? <Droplets size={20} /> : <Layers size={20} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {unit.label}
                                                        {unit.isBaseUnit && <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-500 px-1 py-0.5 rounded border border-blue-100 dark:border-blue-500/20 font-bold">BASE</span>}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-mono italic">{unit.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="p-2 text-primary-500" onClick={() => handleOpenModal(unit)}>
                                                    <Pencil size={18} />
                                                </button>
                                                <button className="p-2 text-red-500" onClick={() => handleDelete(unit.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="p-2 bg-gray-50 dark:bg-dark-900/50 rounded-lg flex flex-col items-center">
                                                <span className="text-gray-400 mb-1">Konversi</span>
                                                <span className="font-mono font-bold text-gray-700 dark:text-dark-200">{unit.baseValue} {unit.group === 'mass' ? 'gram' : unit.group === 'volume' ? 'ml' : 'pcs'}</span>
                                            </div>
                                            <div className="p-2 bg-gray-50 dark:bg-dark-900/50 rounded-lg flex flex-col items-center">
                                                <span className="text-gray-400 mb-1">Grup</span>
                                                <span className="font-medium text-gray-700 dark:text-dark-200">{GROUP_LABELS[unit.group]}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {unit.isPurchaseUnit && (
                                                <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">
                                                    <ShoppingCart size={12} /> Pembelian
                                                </div>
                                            )}
                                            {unit.isUsageUnit && (
                                                <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-wider border border-orange-100 dark:border-orange-500/20">
                                                    <ChefHat size={12} /> Pemakaian
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal max-w-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Scale className="text-primary-500" size={24} />
                                {editingUnit ? 'Edit Data Satuan' : 'Tambah Satuan Baru'}
                            </h2>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors" onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-6">
                                {error && (
                                    <div className="alert alert-error">
                                        <Info size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-dark-300">Grup Satuan</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'mass', label: 'Berat', icon: Scale },
                                                { id: 'volume', label: 'Volume', icon: Droplets },
                                                { id: 'count', label: 'Hitungan', icon: Layers },
                                            ].map((g) => (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, group: g.id })}
                                                    className={`
                                                        flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200
                                                        ${formData.group === g.id 
                                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600' 
                                                            : 'border-gray-100 dark:border-dark-700 text-gray-400 hover:border-gray-200 dark:hover:border-dark-600'}
                                                    `}
                                                >
                                                    <g.icon size={20} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{g.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-dark-300">Satuan Simbol</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Contoh: kg, gr, ml, pcs"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                                            required
                                        />
                                        <p className="text-[10px] text-gray-500 italic">Singkatan teknis satuan.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-dark-300">Label Tampilan</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Contoh: Kilogram (kg)"
                                            value={formData.label}
                                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                            required
                                        />
                                        <p className="text-[10px] text-gray-500 italic">Nama lengkap yang muncul di laporan.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-dark-300 flex justify-between">
                                            Nilai Konversi
                                            <span className="text-primary-500 font-bold">
                                                per {formData.group === 'mass' ? 'gram' : formData.group === 'volume' ? 'ml' : 'pcs'}
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="input pr-12"
                                                value={formData.baseValue}
                                                onChange={(e) => setFormData({ ...formData, baseValue: parseFloat(e.target.value) || 1 })}
                                                required
                                                min="0.0001"
                                                step="any"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">VAL</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-dark-900/50 rounded-2xl border border-gray-100 dark:border-dark-700">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Konfigurasi Penggunaan</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'isBaseUnit', label: 'Satuan Dasar', desc: 'Induk grup', icon: Info },
                                            { id: 'isPurchaseUnit', label: 'Beli', desc: 'Input Nota', icon: ShoppingCart },
                                            { id: 'isUsageUnit', label: 'Pakai', desc: 'Input Resep', icon: ChefHat },
                                        ].map((opt) => (
                                            <label key={opt.id} className={`
                                                cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 flex flex-col gap-1 items-center text-center
                                                ${(formData as any)[opt.id] 
                                                    ? 'border-primary-500 bg-white dark:bg-dark-800 ring-2 ring-primary-500/10 shadow-sm' 
                                                    : 'border-transparent bg-white/50 dark:bg-dark-800/50 text-gray-400 hover:border-gray-200 dark:hover:border-dark-700'}
                                            `}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={(formData as any)[opt.id]}
                                                    onChange={(e) => setFormData({ ...formData, [opt.id]: e.target.checked })}
                                                />
                                                <opt.icon size={18} className={(formData as any)[opt.id] ? 'text-primary-500' : ''} />
                                                <span className="text-[10px] font-extrabold uppercase tracking-tighter truncate w-full">{(formData as any)[opt.id] ? 'Aktif' : opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-dark-300">Deskripsi (Opsional)</label>
                                    <textarea
                                        className="input min-h-[80px] py-3 resize-none"
                                        placeholder="Keterangan tambahan mengenai satuan ini..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer bg-gray-50 dark:bg-dark-900/50 p-6 rounded-b-2xl">
                                <button type="button" className="btn btn-secondary px-6" onClick={handleCloseModal}>Batal</button>
                                <button type="submit" className="btn btn-primary px-8">
                                    {editingUnit ? 'Simpan Update' : 'Daftarkan Satuan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Units;
