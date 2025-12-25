import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Package, X, ArrowRightLeft, Info, Download, FileSpreadsheet } from 'lucide-react';
import Select from 'react-select';
import { ingredientsApi, categoriesApi, unitMasterApi } from '../api';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { PageSkeleton } from '../components/Skeleton';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interface for Unit from database
interface Unit {
    id: number;
    name: string;
    label: string;
    group: string;
    baseValue: number;
    isBaseUnit: boolean;
    isPurchaseUnit: boolean;
    isUsageUnit: boolean;
}

function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [purchaseUnits, setPurchaseUnits] = useState<Unit[]>([]);
    const [usageUnits, setUsageUnits] = useState<Unit[]>([]);
    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        // Purchase info
        purchaseUnit: 'kg',
        purchasePrice: '',
        packageSize: '1',
        // Yield info
        yieldPercentage: '100',
        // Usage info
        usageUnit: 'gram',
        conversionRate: '1000',
    });

    const { showToast, ToastContainer } = useToast();
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; ingredient: any | null }>({
        isOpen: false,
        ingredient: null
    });


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ingredientsRes, categoriesRes, purchaseUnitsRes, usageUnitsRes, allUnitsRes] = await Promise.all([
                ingredientsApi.getAll(),
                categoriesApi.getAll(),
                unitMasterApi.getPurchaseUnits(),
                unitMasterApi.getUsageUnits(),
                unitMasterApi.getAll()
            ]);
            setIngredients(ingredientsRes.data);
            setCategories(categoriesRes.data);
            setPurchaseUnits(purchaseUnitsRes.data);
            setUsageUnits(usageUnitsRes.data);
            setAllUnits(allUnitsRes.data);
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

    // Custom styles for react-select to support both light and dark themes
    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'var(--bg-primary)',
            borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-input)',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.12)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-input-hover)'
            },
            borderRadius: '8px',
            padding: '4px 4px',
            minHeight: '48px'
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-input)',
            borderRadius: '8px',
            zIndex: 9999,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
        }),
        menuList: (base: any) => ({
            ...base,
            padding: '6px'
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected 
                ? 'var(--primary)' 
                : state.isFocused 
                    ? 'var(--bg-tertiary)' 
                    : 'transparent',
            color: state.isSelected ? 'white' : 'var(--text-primary)',
            borderRadius: '6px',
            padding: '10px 12px',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: 'var(--primary)'
            }
        }),
        singleValue: (base: any) => ({
            ...base,
            color: 'var(--text-primary)'
        }),
        input: (base: any) => ({
            ...base,
            color: 'var(--text-primary)'
        }),
        placeholder: (base: any) => ({
            ...base,
            color: 'var(--text-muted)'
        }),
        dropdownIndicator: (base: any) => ({
            ...base,
            color: 'var(--text-muted)',
            '&:hover': {
                color: 'var(--text-primary)'
            }
        }),
        clearIndicator: (base: any) => ({
            ...base,
            color: 'var(--text-muted)',
            '&:hover': {
                color: 'var(--error)'
            }
        }),
        noOptionsMessage: (base: any) => ({
            ...base,
            color: 'var(--text-muted)'
        })
    };

    // Get compatible usage units for selected purchase unit (same group)
    const getCompatibleUsageUnits = (purchaseUnitName: string): Unit[] => {
        const purchaseUnit = allUnits.find(u => u.name === purchaseUnitName);
        if (!purchaseUnit) return usageUnits;
        return usageUnits.filter(u => u.group === purchaseUnit.group);
    };

    // Get default conversion rate from database units
    const getDefaultConversionRate = (purchaseUnitName: string, usageUnitName: string, packageSize: number = 1): number => {
        const fromUnit = allUnits.find(u => u.name === purchaseUnitName);
        const toUnit = allUnits.find(u => u.name === usageUnitName);

        if (!fromUnit || !toUnit) return 1;

        // If units are not in same group, return package size
        if (fromUnit.group !== toUnit.group) {
            return packageSize || 1;
        }

        // Calculate conversion rate based on baseValue
        // fromUnit.baseValue / toUnit.baseValue = conversion rate
        // e.g., kg (1000) to gram (1) = 1000
        const baseRate = fromUnit.baseValue / toUnit.baseValue;

        // For package-based units like botol and karung
        // The packageSize represents the actual content (ml for botol, kg for karung)
        // We need to convert to the usage unit
        if (purchaseUnitName === 'botol') {
            // Botol contains packageSize ml, convert to usage unit
            // baseValue of ml is 1, so packageSize ml = packageSize / toUnit.baseValue
            return packageSize / toUnit.baseValue;
        } else if (purchaseUnitName === 'karung') {
            // Karung contains packageSize kg, convert to usage unit
            // 1 kg = 1000 gram, so packageSize kg = packageSize * 1000 / toUnit.baseValue
            return (packageSize * 1000) / toUnit.baseValue;
        }

        return baseRate;
    };


    // Calculate price per usage unit (considering yield)
    const calculatePricePerUsageUnit = () => {
        const purchasePrice = parseFloat(formData.purchasePrice) || 0;
        const conversionRate = parseFloat(formData.conversionRate) || 1;
        const yieldPct = parseFloat(formData.yieldPercentage) || 100;
        if (conversionRate <= 0) return 0;
        // Apply yield factor: lower yield = higher cost per usable unit
        const yieldFactor = Math.min(Math.max(yieldPct, 1), 100) / 100;
        const effectiveConversion = conversionRate * yieldFactor;
        return purchasePrice / effectiveConversion;
    };

    // Handle purchase unit change
    const handlePurchaseUnitChange = (newPurchaseUnit: string) => {
        const compatibleUnits = getCompatibleUsageUnits(newPurchaseUnit);
        const currentUsageValid = compatibleUnits.some(u => u.name === formData.usageUnit);
        const newUsageUnit = currentUsageValid ? formData.usageUnit : compatibleUnits[0]?.name || 'gram';
        
        // Set default netto/package size based on purchase unit
        let defaultNetto: number;
        switch (newPurchaseUnit) {
            case 'kg':
                defaultNetto = 1000; // 1000 gram
                break;
            case 'karung':
                defaultNetto = 50000; // 50 kg = 50000 gram
                break;
            case 'ons':
                defaultNetto = 100; // 100 gram
                break;
            case 'liter':
                defaultNetto = 1000; // 1000 ml
                break;
            case 'botol':
                defaultNetto = 600; // 600 ml
                break;
            case 'pcs':
            case 'butir':
            case 'bungkus':
            case 'sachet':
            case 'batang':
            case 'lembar':
            case 'ikat':
            case 'siung':
                defaultNetto = 1; // 1 pcs
                break;
            case 'lusin':
                defaultNetto = 12; // 12 pcs
                break;
            default:
                defaultNetto = 1000;
        }
        
        const newConversionRate = getDefaultConversionRate(newPurchaseUnit, newUsageUnit, defaultNetto);
        
        setFormData({
            ...formData,
            purchaseUnit: newPurchaseUnit,
            usageUnit: newUsageUnit,
            packageSize: defaultNetto.toString(),
            conversionRate: newConversionRate.toString(),
        });
    };

    // Handle usage unit change
    const handleUsageUnitChange = (newUsageUnit: string) => {
        const packageSize = parseFloat(formData.packageSize) || 1;
        const newConversionRate = getDefaultConversionRate(formData.purchaseUnit, newUsageUnit, packageSize);
        
        setFormData({
            ...formData,
            usageUnit: newUsageUnit,
            conversionRate: newConversionRate.toString(),
        });
    };

    // Handle package size change
    const handlePackageSizeChange = (newPackageSize: string) => {
        const packageSize = parseFloat(newPackageSize) || 1;
        const newConversionRate = getDefaultConversionRate(formData.purchaseUnit, formData.usageUnit, packageSize);
        
        setFormData({
            ...formData,
            packageSize: newPackageSize,
            conversionRate: newConversionRate.toString(),
        });
    };

    const handleOpenModal = (ingredient = null) => {
        if (ingredient) {
            setEditingIngredient(ingredient);
            setFormData({
                name: ingredient.name,
                categoryId: ingredient.categoryId?.toString() || '',
                purchaseUnit: ingredient.purchaseUnit || 'kg',
                purchasePrice: ingredient.purchasePrice?.toString() || ingredient.pricePerUnit?.toString() || '',
                packageSize: ingredient.packageSize?.toString() || '1',
                yieldPercentage: ingredient.yieldPercentage?.toString() || '100',
                usageUnit: ingredient.usageUnit || ingredient.unit || 'gram',
                conversionRate: ingredient.conversionRate?.toString() || '1000',
            });
        } else {
            setEditingIngredient(null);
            setFormData({
                name: '',
                categoryId: '',
                purchaseUnit: 'kg',
                purchasePrice: '',
                packageSize: '1',
                yieldPercentage: '100',
                usageUnit: 'gram',
                conversionRate: '1000',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingIngredient(null);
        setFormData({
            name: '',
            categoryId: '',
            purchaseUnit: 'kg',
            purchasePrice: '',
            packageSize: '1',
            yieldPercentage: '100',
            usageUnit: 'gram',
            conversionRate: '1000',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                purchasePrice: parseFloat(formData.purchasePrice) || 0,
                packageSize: parseFloat(formData.packageSize) || 1,
                yieldPercentage: parseFloat(formData.yieldPercentage) || 100,
                conversionRate: parseFloat(formData.conversionRate) || 1,
            };

            if (editingIngredient) {
                await ingredientsApi.update(editingIngredient.id, submitData);
            } else {
                await ingredientsApi.create(submitData);
            }
            handleCloseModal();
            loadData();
        } catch (error) {
            console.error('Failed to save ingredient:', error);
        }
    };


    const handleDelete = (ingredient) => {
        setConfirmDelete({
            isOpen: true,
            ingredient: ingredient
        });
    };

    const executeDelete = async () => {
        if (!confirmDelete.ingredient) return;
        
        try {
            await ingredientsApi.delete(confirmDelete.ingredient.id);
            showToast('Bahan baku berhasil dihapus', 'success');
            loadData();
        } catch (error: any) {
            console.error('Failed to delete ingredient:', error);
            const errorMessage = error.response?.data?.error || 'Gagal menghapus bahan. Pastikan bahan tidak sedang digunakan.';
            showToast(errorMessage, 'error');
        } finally {
            setConfirmDelete({ isOpen: false, ingredient: null });
        }
    };

    const filteredIngredients = ingredients.filter(ing => {
        const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || ing.categoryId?.toString() === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Export to Excel (XLS)
    const exportToExcel = () => {
        const exportData = filteredIngredients.map((ing, index) => ({
            'No': index + 1,
            'Nama Bahan': ing.name,
            'Kategori': ing.category?.name || '-',
            'Unit Beli': ing.purchaseUnit || 'kg',
            'Netto': ing.packageSize || 1,
            'Harga Beli': ing.purchasePrice || 0,
            'Unit Pakai': ing.usageUnit || ing.unit || 'gram',
            'Konversi': ing.conversionRate || 1,
            'Yield (%)': ing.yieldPercentage || 100,
            'Harga/Unit Pakai': ing.pricePerUnit || 0,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bahan Baku');

        // Set column widths
        const colWidths = [
            { wch: 5 },   // No
            { wch: 25 },  // Nama Bahan
            { wch: 15 },  // Kategori
            { wch: 12 },  // Unit Beli
            { wch: 10 },  // Netto
            { wch: 15 },  // Harga Beli
            { wch: 12 },  // Unit Pakai
            { wch: 10 },  // Konversi
            { wch: 10 },  // Yield
            { wch: 18 },  // Harga/Unit Pakai
        ];
        ws['!cols'] = colWidths;

        const fileName = `Bahan_Baku_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Data Master Bahan Baku', 14, 22);
        
        // Date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Diekspor pada: ${new Date().toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`, 14, 30);

        // Table data
        const tableData = filteredIngredients.map((ing, index) => [
            index + 1,
            ing.name,
            ing.category?.name || '-',
            ing.purchaseUnit || 'kg',
            formatCurrency(ing.purchasePrice || 0),
            ing.usageUnit || ing.unit || 'gram',
            formatCurrency(ing.pricePerUnit || 0),
        ]);

        // Using autoTable
        autoTable(doc, {
            startY: 38,
            head: [['No', 'Nama Bahan', 'Kategori', 'Unit Beli', 'Harga Beli', 'Unit Pakai', 'Harga/Unit']],
            body: tableData,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [99, 102, 241],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250],
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { cellWidth: 40 },
                2: { cellWidth: 25 },
                3: { halign: 'center', cellWidth: 22 },
                4: { halign: 'right', cellWidth: 28 },
                5: { halign: 'center', cellWidth: 22 },
                6: { halign: 'right', cellWidth: 28 },
            },
        });

        // Footer with page number
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Halaman ${i} dari ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        const fileName = `Bahan_Baku_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    // Get net content unit based on purchase unit group
    const getNettoUnit = (purchaseUnitName: string): string => {
        const unit = allUnits.find(u => u.name === purchaseUnitName);
        if (!unit) return '';
        
        switch (unit.group) {
            case 'mass':
                return 'gram';
            case 'volume':
                return 'ml';
            case 'count':
                return 'pcs';
            default:
                return '';
        }
    };

    // Get label for net content based on purchase unit
    const getNettoLabel = (): string => {
        return 'Netto / Isi Bersih';
    };

    // Get placeholder for net content
    const getNettoPlaceholder = (purchaseUnitName: string): string => {
        switch (purchaseUnitName) {
            case 'kg':
                return '1000';
            case 'karung':
                return '50000';
            case 'ons':
                return '100';
            case 'liter':
                return '1000';
            case 'botol':
                return '600';
            case 'pcs':
            case 'butir':
            case 'bungkus':
            case 'sachet':
                return '1';
            case 'lusin':
                return '12';
            default:
                return '1000';
        }
    };

    const nettoUnit = getNettoUnit(formData.purchaseUnit);
    const nettoLabel = getNettoLabel();
    const nettoPlaceholder = getNettoPlaceholder(formData.purchaseUnit);

    const compatibleUsageUnits = getCompatibleUsageUnits(formData.purchaseUnit);
    const pricePerUsageUnit = calculatePricePerUsageUnit();

    if (loading) {
        return <PageSkeleton type="table" />;
    }

    return (
        <>
            <ToastContainer />
            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                title="Hapus Bahan Baku"
                message={`Apakah Anda yakin ingin menghapus bahan baku "${confirmDelete.ingredient?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, ingredient: null })}
            />
            <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Bahan Baku</h1>
                <p className="text-gray-500 dark:text-dark-400">Kelola daftar bahan baku dengan konversi satuan otomatis</p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Cari bahan baku..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="input w-full sm:w-48"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button 
                        className="btn btn-secondary" 
                        onClick={exportToExcel}
                        title="Export ke Excel"
                    >
                        <FileSpreadsheet size={18} />
                        <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={exportToPDF}
                        title="Export ke PDF"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button className="btn btn-primary flex-1 sm:flex-none" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        Tambah Bahan
                    </button>
                </div>
            </div>

            {filteredIngredients.length === 0 ? (
                <div className="card p-8">
                    <div className="empty-state">
                        <Package size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak ada bahan baku</h3>
                        <p className="text-sm text-gray-500 dark:text-dark-400">{searchTerm || filterCategory ? 'Tidak ditemukan bahan dengan filter tersebut' : 'Mulai dengan menambahkan bahan baku'}</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="card hidden lg:block overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nama Bahan</th>
                                        <th>Kategori</th>
                                        <th>Unit Beli</th>
                                        <th>Harga Beli</th>
                                        <th>Unit Pakai</th>
                                        <th>Harga/Unit Pakai</th>
                                        <th style={{ width: '120px' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIngredients.map((ingredient) => (
                                        <tr key={ingredient.id}>
                                            <td className="font-medium text-gray-900 dark:text-white">{ingredient.name}</td>
                                            <td>
                                                {ingredient.category ? (
                                                    <span className="badge badge-secondary">
                                                        {ingredient.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-dark-400">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                                    {ingredient.purchaseUnit || 'kg'}
                                                    {ingredient.packageSize && ingredient.packageSize !== 1 && 
                                                        ` (${ingredient.packageSize})`}
                                                </span>
                                            </td>
                                            <td className="font-semibold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(ingredient.purchasePrice || 0)}
                                            </td>
                                            <td>
                                                <span className="badge bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400">
                                                    {ingredient.usageUnit || ingredient.unit}
                                                </span>
                                            </td>
                                            <td className="font-semibold text-primary-600 dark:text-primary-400">
                                                {formatCurrency(ingredient.pricePerUnit || 0)}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-secondary btn-icon"
                                                        onClick={() => handleOpenModal(ingredient)}
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-icon"
                                                        onClick={() => handleDelete(ingredient)}
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
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                        {filteredIngredients.map((ingredient) => (
                            <div key={ingredient.id} className="card p-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                        <Package size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{ingredient.name}</h3>
                                        {ingredient.category && (
                                            <span className="text-xs text-gray-500 dark:text-dark-400">{ingredient.category.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg mb-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Beli</p>
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(ingredient.purchasePrice || 0)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-dark-400">/ {ingredient.purchaseUnit || 'kg'}</p>
                                    </div>
                                    <ArrowRightLeft size={16} className="text-gray-400 dark:text-dark-500" />
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-dark-400 mb-1">Pakai</p>
                                        <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                            {formatCurrency(ingredient.pricePerUnit || 0)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-dark-400">/ {ingredient.usageUnit || ingredient.unit}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-secondary flex-1 text-sm py-2"
                                        onClick={() => handleOpenModal(ingredient)}
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button
                                        className="btn btn-danger flex-1 text-sm py-2"
                                        onClick={() => handleDelete(ingredient)}
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {editingIngredient ? 'Edit Bahan' : 'Tambah Bahan Baru'}
                            </h2>
                            <button className="btn btn-ghost btn-icon" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-700">
                                        <span className="text-lg">📋</span>
                                        <h3 className="font-medium text-gray-900 dark:text-white">Informasi Dasar</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                Kategori <span className="text-red-500 dark:text-red-400">*</span>
                                            </label>
                                            <Select
                                                options={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
                                                value={formData.categoryId ? { value: formData.categoryId, label: categories.find(c => c.id.toString() === formData.categoryId)?.name || '' } : null}
                                                onChange={(selected) => setFormData({ ...formData, categoryId: selected?.value || '' })}
                                                styles={selectStyles}
                                                placeholder="Pilih kategori..."
                                                isClearable
                                                isSearchable
                                                noOptionsMessage={() => "Tidak ada kategori"}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                Nama Bahan <span className="text-red-500 dark:text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Contoh: Tepung Terigu"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Purchase Info Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-700">
                                        <span className="text-lg">💰</span>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">Informasi Pembelian</h3>
                                            <p className="text-xs text-gray-500 dark:text-dark-400">Saat membeli bahan di toko/pasar</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                Unit Beli <span className="text-red-500 dark:text-red-400">*</span>
                                            </label>
                                            <Select
                                                options={purchaseUnits.map(unit => ({ value: unit.name, label: unit.label }))}
                                                value={formData.purchaseUnit ? { value: formData.purchaseUnit, label: purchaseUnits.find(u => u.name === formData.purchaseUnit)?.label || formData.purchaseUnit } : null}
                                                onChange={(selected) => handlePurchaseUnitChange(selected?.value || 'kg')}
                                                styles={selectStyles}
                                                placeholder="Pilih unit..."
                                                isSearchable
                                                noOptionsMessage={() => "Tidak ada unit"}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                Netto <span className="text-red-500 dark:text-red-400">*</span>
                                                <span className="text-xs text-gray-500 dark:text-dark-500 ml-1">({nettoUnit}/unit)</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="input"
                                                placeholder={nettoPlaceholder}
                                                value={formData.packageSize}
                                                onChange={(e) => handlePackageSizeChange(e.target.value)}
                                                min="0.01"
                                                step="any"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                Harga Beli <span className="text-red-500 dark:text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-dark-400 text-sm">Rp</span>
                                                <input
                                                    type="number"
                                                    className="input pl-10"
                                                    placeholder="30000"
                                                    value={formData.purchasePrice}
                                                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Yield & Usage Section - Combined */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Yield Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-700">
                                            <span className="text-lg">📉</span>
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">Yield (Penyusutan)</h3>
                                                <p className="text-xs text-gray-500 dark:text-dark-400">Bahan tersisa setelah diproses</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                    Persentase Yield (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    placeholder="100"
                                                    value={formData.yieldPercentage}
                                                    onChange={(e) => setFormData({ ...formData, yieldPercentage: e.target.value })}
                                                    min="1"
                                                    max="100"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="badge badge-secondary text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-500" onClick={() => setFormData({...formData, yieldPercentage: '90'})}>🥔 90%</span>
                                                <span className="badge badge-secondary text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-500" onClick={() => setFormData({...formData, yieldPercentage: '70'})}>🐔 70%</span>
                                                <span className="badge badge-secondary text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-500" onClick={() => setFormData({...formData, yieldPercentage: '50'})}>🍤 50%</span>
                                                <span className="badge badge-secondary text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-500" onClick={() => setFormData({...formData, yieldPercentage: '100'})}>🧅 100%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Usage Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-dark-700">
                                            <span className="text-lg">🥄</span>
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">Pemakaian di Resep</h3>
                                                <p className="text-xs text-gray-500 dark:text-dark-400">Satuan saat digunakan</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                    Unit Pakai <span className="text-red-500 dark:text-red-400">*</span>
                                                </label>
                                                <Select
                                                    options={compatibleUsageUnits.map(unit => ({ value: unit.name, label: unit.label }))}
                                                    value={formData.usageUnit ? { value: formData.usageUnit, label: compatibleUsageUnits.find(u => u.name === formData.usageUnit)?.label || formData.usageUnit } : null}
                                                    onChange={(selected) => handleUsageUnitChange(selected?.value || 'gram')}
                                                    styles={selectStyles}
                                                    placeholder="Pilih unit..."
                                                    isSearchable
                                                    noOptionsMessage={() => "Tidak ada unit"}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-dark-300">
                                                    Konversi
                                                    <span className="text-xs text-gray-400 dark:text-dark-500 ml-1">(1 {formData.purchaseUnit} = ? {formData.usageUnit})</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    value={formData.conversionRate}
                                                    onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })}
                                                    min="0.001"
                                                    step="any"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Conversion Preview */}
                                <div className="p-4 bg-gradient-to-r from-primary-500/10 to-blue-500/10 border border-primary-500/20 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                            <ArrowRightLeft size={20} className="text-primary-400" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Pratinjau Konversi</p>
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md">
                                                    1 {formData.purchaseUnit} = {formatCurrency(parseFloat(formData.purchasePrice) || 0)}
                                                </span>
                                                <span className="text-gray-400 dark:text-dark-400">→</span>
                                                <span className="px-2 py-1 bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-md">
                                                    {(() => {
                                                        const conv = parseFloat(formData.conversionRate) || 1000;
                                                        const yld = parseFloat(formData.yieldPercentage) || 100;
                                                        return Math.round(conv * (yld / 100));
                                                    })()} {formData.usageUnit} bersih
                                                </span>
                                            </div>
                                            {parseFloat(formData.yieldPercentage) < 100 && (
                                                <p className="text-xs text-amber-400">
                                                    ⚠️ Yield {formData.yieldPercentage}% — waste {100 - parseFloat(formData.yieldPercentage)}%
                                                </p>
                                            )}
                                            <div className="pt-2 border-t border-gray-200 dark:border-dark-700/50">
                                                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-2">
                                                    <Info size={16} />
                                                    {formatCurrency(pricePerUsageUnit)} <span className="text-sm font-normal text-gray-500 dark:text-dark-400">per {formData.usageUnit}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingIngredient ? 'Simpan Perubahan' : 'Tambah Bahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}

export default Ingredients;
