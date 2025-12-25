import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, ChefHat, X, Video, FileText, Layers, Tags, Download } from 'lucide-react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { recipesApi, ingredientsApi, recipeCategoriesApi } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import { PageSkeleton } from '../components/Skeleton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AvailableComponent {
    id: number;
    name: string;
    servings: number;
    costPerServing: number;
}

function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [availableComponents, setAvailableComponents] = useState<AvailableComponent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [ingredientWarning, setIngredientWarning] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; recipe: any | null }>({
        isOpen: false,
        recipe: null
    });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        servings: 1,
        categoryId: '',
        videoUrl: '',
        sop: '',
        ingredients: [],
        components: [] // Sub-recipes
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [recipesRes, ingredientsRes, componentsRes, categoriesRes] = await Promise.all([
                recipesApi.getAll(),
                ingredientsApi.getAll(),
                recipesApi.getComponents(),
                recipeCategoriesApi.getAll()
            ]);
            setRecipes(recipesRes.data);
            setIngredients(ingredientsRes.data);
            setAvailableComponents(componentsRes.data);
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
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Custom styles for react-select to support both light and dark themes
    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-input)',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.12)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--primary)' : 'var(--border-input-hover)'
            },
            borderRadius: '8px',
            padding: '2px 4px',
            minHeight: '42px'
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-input)',
            borderRadius: '8px',
            zIndex: 9999,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
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

    // Prepare ingredient options for react-select
    const ingredientOptions = ingredients.map(ing => ({
        value: ing.id.toString(),
        label: `${ing.name} (${formatCurrency(ing.pricePerUnit)}/${ing.unit})`
    }));

    // Prepare component (sub-recipe) options for react-select
    const componentOptions = availableComponents.map(comp => ({
        value: comp.id.toString(),
        label: `${comp.name} (${formatCurrency(comp.costPerServing)}/porsi)`
    }));

    // Prepare category options for creatable select
    const categoryOptions = categories.map(cat => ({
        value: cat.id.toString(),
        label: cat.name
    }));

    // Handle creating new category inline
    const handleCreateCategory = async (inputValue: string) => {
        setIsCreatingCategory(true);
        try {
            const res = await recipeCategoriesApi.create({ name: inputValue });
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

    // Helper function to extract YouTube video ID from various URL formats
    const getYouTubeVideoId = (url: string): string => {
        if (!url) return '';
        
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[2].length === 11) ? match[2] : '';
    };

    const handleOpenModal = async (recipe = null) => {
        // Load available components (excluding the recipe being edited to prevent circular references)
        try {
            const componentsRes = await recipesApi.getComponents(recipe?.id);
            setAvailableComponents(componentsRes.data);
        } catch (error) {
            console.error('Failed to load components:', error);
        }

        if (recipe) {
            setEditingRecipe(recipe);
            setFormData({
                name: recipe.name,
                description: recipe.description || '',
                servings: recipe.servings,
                categoryId: recipe.categoryId?.toString() || '',
                videoUrl: recipe.videoUrl || '',
                sop: recipe.sop || '',
                ingredients: recipe.ingredients.map(ri => ({
                    ingredientId: ri.ingredientId.toString(),
                    quantity: ri.quantity.toString()
                })),
                components: (recipe.components || []).map(comp => ({
                    subRecipeId: comp.subRecipeId.toString(),
                    quantity: comp.quantity.toString()
                }))
            });
        } else {
            setEditingRecipe(null);
            setFormData({
                name: '',
                description: '',
                servings: 1,
                categoryId: '',
                videoUrl: '',
                sop: '',
                ingredients: [{ ingredientId: '', quantity: '' }],
                components: []
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRecipe(null);
    };

    const handleViewDetail = async (recipe) => {
        try {
            const res = await recipesApi.getById(recipe.id);
            setSelectedRecipe(res.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Failed to load recipe detail:', error);
        }
    };

    // Ingredient handlers
    const handleAddIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { ingredientId: '', quantity: '' }]
        });
    };

    const handleRemoveIngredient = (index) => {
        // Block deletion if only 1 ingredient left
        if (formData.ingredients.length <= 1) {
            setIngredientWarning(true);
            return;
        }
        setIngredientWarning(false);
        setFormData({
            ...formData,
            ingredients: formData.ingredients.filter((_, i) => i !== index)
        });
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    // Component (sub-recipe) handlers
    const handleAddComponent = () => {
        setFormData({
            ...formData,
            components: [...formData.components, { subRecipeId: '', quantity: '1' }]
        });
    };

    const handleRemoveComponent = (index) => {
        setFormData({
            ...formData,
            components: formData.components.filter((_, i) => i !== index)
        });
    };

    const handleComponentChange = (index, field, value) => {
        const newComponents = [...formData.components];
        newComponents[index][field] = value;
        setFormData({ ...formData, components: newComponents });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validIngredients = formData.ingredients.filter(
            ing => ing.ingredientId && ing.quantity
        );
        const validComponents = formData.components.filter(
            comp => comp.subRecipeId && comp.quantity
        );

        if (validIngredients.length === 0 && validComponents.length === 0) {
            alert('Tambahkan minimal satu bahan baku!');
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                ingredients: validIngredients,
                components: validComponents
            };

            if (editingRecipe) {
                await recipesApi.update(editingRecipe.id, dataToSubmit);
            } else {
                await recipesApi.create(dataToSubmit);
            }
            handleCloseModal();
            loadData();
        } catch (error) {
            console.error('Failed to save recipe:', error);
        }
    };

    const handleDelete = (recipe) => {
        setConfirmDelete({
            isOpen: true,
            recipe: recipe
        });
    };

    const executeDelete = async () => {
        if (!confirmDelete.recipe) return;
        
        try {
            await recipesApi.delete(confirmDelete.recipe.id);
            loadData();
        } catch (error) {
            console.error('Failed to delete recipe:', error);
            alert('Gagal menghapus resep');
        } finally {
            setConfirmDelete({ isOpen: false, recipe: null });
        }
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Export recipe to PDF
    const exportRecipeToPDF = (recipe: any) => {
        const doc = new jsPDF();
        let yPosition = 20;

        // Helper function to format date
        const formatDate = (dateString: string) => {
            if (!dateString) return '-';
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        // Title
        doc.setFontSize(24);
        doc.setTextColor(249, 115, 22); // Primary orange color
        doc.text(recipe.name, 14, yPosition);
        yPosition += 10;

        // Category if exists
        if (recipe.category?.name) {
            doc.setFontSize(12);
            doc.setTextColor(139, 92, 246); // Purple
            doc.text(`Kategori: ${recipe.category.name}`, 14, yPosition);
            yPosition += 8;
        }

        // Description
        if (recipe.description) {
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            const descLines = doc.splitTextToSize(recipe.description, 180);
            doc.text(descLines, 14, yPosition);
            yPosition += descLines.length * 5 + 5;
        }

        // Servings
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`Jumlah Porsi: ${recipe.servings} porsi`, 14, yPosition);
        yPosition += 10;

        // Divider line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPosition, 196, yPosition);
        yPosition += 10;

        // SOP Section
        if (recipe.sop) {
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('📋 Standar Operasional Prosedur (SOP)', 14, yPosition);
            yPosition += 8;

            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            const sopLines = doc.splitTextToSize(recipe.sop, 180);
            
            // Check if we need a new page
            if (yPosition + sopLines.length * 5 > 270) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.text(sopLines, 14, yPosition);
            yPosition += sopLines.length * 5 + 10;
        }

        // Ingredients Section
        if (recipe.ingredientCosts && recipe.ingredientCosts.length > 0) {
            // Check if we need a new page
            if (yPosition > 220) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('🥬 Bahan Baku', 14, yPosition);
            yPosition += 8;

            const ingredientData = recipe.ingredientCosts.map((item: any, index: number) => [
                index + 1,
                item.name,
                `${item.quantity} ${item.unit}`,
                formatCurrency(item.pricePerUnit || 0),
                formatCurrency(item.subtotal)
            ]);

            autoTable(doc, {
                startY: yPosition,
                head: [['No', 'Nama Bahan', 'Jumlah', 'Harga/Unit', 'Subtotal']],
                body: ingredientData,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255] },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { cellWidth: 55 },
                    2: { halign: 'center', cellWidth: 30 },
                    3: { halign: 'right', cellWidth: 35 },
                    4: { halign: 'right', cellWidth: 35 }
                },
                alternateRowStyles: { fillColor: [245, 247, 250] }
            });

            yPosition = (doc as any).lastAutoTable.finalY + 10;
        }

        // Components Section
        if (recipe.componentCosts && recipe.componentCosts.length > 0) {
            // Check if we need a new page
            if (yPosition > 220) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('🧩 Resep Komponen', 14, yPosition);
            yPosition += 8;

            const componentData = recipe.componentCosts.map((item: any, index: number) => [
                index + 1,
                item.name,
                `${item.quantity} ${item.unit}`,
                formatCurrency(item.costPerServing || 0),
                formatCurrency(item.subtotal)
            ]);

            autoTable(doc, {
                startY: yPosition,
                head: [['No', 'Nama Komponen', 'Porsi', 'Harga/Porsi', 'Subtotal']],
                body: componentData,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { cellWidth: 55 },
                    2: { halign: 'center', cellWidth: 30 },
                    3: { halign: 'right', cellWidth: 35 },
                    4: { halign: 'right', cellWidth: 35 }
                },
                alternateRowStyles: { fillColor: [248, 245, 255] }
            });

            yPosition = (doc as any).lastAutoTable.finalY + 10;
        }

        // HPP Summary
        if (yPosition > 230) {
            doc.addPage();
            yPosition = 20;
        }

        // HPP Box
        doc.setFillColor(255, 247, 237); // Light orange background
        doc.setDrawColor(249, 115, 22);
        doc.roundedRect(14, yPosition, 182, 40, 3, 3, 'FD');
        yPosition += 10;

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Total HPP (Harga Pokok Produksi)', 20, yPosition);
        yPosition += 8;

        doc.setFontSize(22);
        doc.setTextColor(249, 115, 22);
        doc.text(formatCurrency(recipe.totalCost || 0), 20, yPosition);
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`HPP per Porsi: ${formatCurrency(recipe.costPerServing || 0)}`, 20, yPosition + 10);
        yPosition += 35;

        // Timestamps
        doc.setFontSize(10);
        doc.setTextColor(130, 130, 130);
        doc.text(`Tanggal Pembuatan: ${formatDate(recipe.createdAt)}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Terakhir Diedit: ${formatDate(recipe.updatedAt)}`, 14, yPosition);
        yPosition += 10;

        // Footer with page numbers
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
            // Export timestamp
            doc.text(
                `Diekspor pada: ${new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                14,
                doc.internal.pageSize.getHeight() - 10
            );
        }

        // Save the PDF
        const fileName = `Resep_${recipe.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    if (loading) {
        return <PageSkeleton type="cards" />;
    }

    return (
        <>
            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                title="Hapus Resep"
                message={`Apakah Anda yakin ingin menghapus resep "${confirmDelete.recipe?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, recipe: null })}
            />
            <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Resep</h1>
                <p className="text-gray-500 dark:text-dark-400">Kelola koleksi resep dan lihat HPP otomatis</p>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-400" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Cari resep..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary flex-1 sm:flex-none" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Tambah Resep
                </button>
            </div>

            {filteredRecipes.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <ChefHat />
                        <h3>Tidak ada resep</h3>
                        <p>{searchTerm ? 'Tidak ditemukan resep dengan kata kunci tersebut' : 'Mulai dengan menambahkan resep'}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {filteredRecipes.map((recipe) => (
                        <div 
                            key={recipe.id} 
                            className="group bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer flex flex-col"
                            onClick={() => handleViewDetail(recipe)}
                        >
                            {/* Card Header with Gradient - No Badges */}
                            <div className="relative h-28 md:h-32 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.2),transparent)]"></div>
                                <ChefHat size={48} className="md:hidden text-primary/80 group-hover:scale-110 transition-transform duration-300" />
                                <ChefHat size={56} className="hidden md:block text-primary/80 group-hover:scale-110 transition-transform duration-300" />
                            </div>

                            {/* Card Content */}
                            <div className="p-3 md:p-5 flex flex-col flex-1">
                                {/* Title */}
                                <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                                    {recipe.name}
                                </h3>

                                {/* Cost Information */}
                                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4">
                                    <div className="bg-gray-100 dark:bg-slate-700/30 rounded-lg p-2 md:p-3">
                                        <div className="text-[9px] md:text-xs text-gray-500 dark:text-slate-400 mb-1 whitespace-nowrap">Total HPP</div>
                                        <div className="text-[10px] md:text-base font-bold text-primary break-words leading-tight">
                                            {formatCurrency(recipe.totalCost)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-slate-700/30 rounded-lg p-2 md:p-3">
                                        <div className="text-[9px] md:text-xs text-gray-500 dark:text-slate-400 mb-1 whitespace-nowrap">Per Porsi</div>
                                        <div className="text-[10px] md:text-base font-bold text-green-600 dark:text-green-400 break-words leading-tight">
                                            {formatCurrency(recipe.costPerServing)}
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent mb-3 md:mb-4"></div>

                                {/* Description - Moved to bottom with flex-1 to push buttons down */}
                                <p className="text-[11px] md:text-sm text-gray-600 dark:text-slate-400 mb-3 md:mb-4 line-clamp-2 leading-tight flex-1">
                                    {recipe.description || `${recipe.ingredients?.length || 0} bahan${recipe.components?.length > 0 ? ` + ${recipe.components.length} komponen` : ''}`}
                                </p>

                                {/* Action Buttons - Always at bottom */}
                                <div className="flex gap-1.5 md:gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-lg bg-gray-200 dark:bg-slate-700/50 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 transition-all duration-200 text-xs md:text-sm font-medium"
                                        onClick={() => handleOpenModal(recipe)}
                                        title="Edit Resep"
                                    >
                                        <Pencil size={14} className="md:w-4 md:h-4" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>
                                    <button
                                        className="flex items-center justify-center gap-1 px-2 md:px-4 py-2 md:py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-all duration-200 text-xs md:text-sm font-medium"
                                        onClick={() => handleDelete(recipe)}
                                        title="Hapus Resep"
                                    >
                                        <Trash2 size={14} className="md:w-4 md:h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Recipe Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-lg recipe-modal-unified" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingRecipe ? 'Edit Resep' : 'Tambah Resep Baru'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body recipe-form-unified">
                                
                                {/* Nama Resep */}
                                <div className="recipe-field">
                                    <label className="recipe-label">
                                        Nama Resep <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="recipe-input"
                                        placeholder="Contoh: Ayam Geprek, Nasi Goreng Spesial..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Kategori & Porsi */}
                                <div className="recipe-row">
                                    <div className="recipe-field">
                                        <label className="recipe-label">
                                            <Tags size={14} className="label-icon" />
                                            Kategori Resep
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
                                            noOptionsMessage={() => "Ketik untuk membuat baru"}
                                        />
                                    </div>

                                    <div className="recipe-field recipe-field-small">
                                        <label className="recipe-label">
                                            Jumlah Porsi <span className="required">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="recipe-input"
                                            value={formData.servings}
                                            onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div className="recipe-field">
                                    <label className="recipe-label">Deskripsi</label>
                                    <textarea
                                        className="recipe-textarea"
                                        placeholder="Deskripsi singkat tentang resep ini..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                {/* Video URL */}
                                <div className="recipe-field">
                                    <label className="recipe-label">
                                        <Video size={14} className="label-icon" />
                                        Link Video YouTube
                                    </label>
                                    <input
                                        type="url"
                                        className="recipe-input"
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    />
                                </div>

                                {/* SOP */}
                                <div className="recipe-field">
                                    <label className="recipe-label">
                                        <FileText size={14} className="label-icon" />
                                        SOP Produksi
                                    </label>
                                    <textarea
                                        className="recipe-textarea"
                                        placeholder="Langkah-langkah produksi resep ini..."
                                        value={formData.sop}
                                        onChange={(e) => setFormData({ ...formData, sop: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                {/* Divider */}
                                <div className="recipe-divider">
                                    <span>🥬 Bahan-bahan</span>
                                </div>

                                {/* Warning Message */}
                                {ingredientWarning && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">
                                        <span>⚠️</span>
                                        <span>Minimal harus ada 1 bahan dimasukan</span>
                                    </div>
                                )}

                                {/* Ingredients */}
                                <div className="recipe-items-list">
                                    {formData.ingredients.map((ing, index) => (
                                        <div key={index} className="recipe-item-row">
                                            <div className="recipe-item-select">
                                                <Select
                                                    options={ingredientOptions}
                                                    value={ingredientOptions.find(opt => opt.value === ing.ingredientId) || null}
                                                    onChange={(selected) => handleIngredientChange(index, 'ingredientId', selected?.value || '')}
                                                    styles={selectStyles}
                                                    placeholder="Pilih bahan..."
                                                    isClearable
                                                    isSearchable
                                                    noOptionsMessage={() => "Tidak ada bahan"}
                                                />
                                            </div>
                                            <input
                                                type="number"
                                                className="recipe-input recipe-item-qty"
                                                placeholder="Jumlah"
                                                value={ing.quantity}
                                                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                                step="0.01"
                                                min="0"
                                            />
                                            <button
                                                type="button"
                                                className="recipe-item-delete"
                                                onClick={() => handleRemoveIngredient(index)}
                                                title="Hapus bahan"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="recipe-add-item-btn"
                                    onClick={handleAddIngredient}
                                >
                                    <Plus size={18} />
                                    Tambah Bahan
                                </button>

                                {/* Divider - Components */}
                                <div className="recipe-divider">
                                    <span><Layers size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Resep Komponen (Opsional)</span>
                                </div>

                                {/* Components */}
                                {availableComponents.length === 0 ? (
                                    <p className="recipe-empty-hint">
                                        Belum ada resep lain yang tersedia sebagai komponen
                                    </p>
                                ) : (
                                    <>
                                        <div className="recipe-items-list">
                                            {formData.components.map((comp, index) => (
                                                <div key={index} className="recipe-item-row">
                                                    <div className="recipe-item-select">
                                                        <Select
                                                            options={componentOptions}
                                                            value={componentOptions.find(opt => opt.value === comp.subRecipeId) || null}
                                                            onChange={(selected) => handleComponentChange(index, 'subRecipeId', selected?.value || '')}
                                                            styles={selectStyles}
                                                            placeholder="Pilih resep komponen..."
                                                            isClearable
                                                            isSearchable
                                                            noOptionsMessage={() => "Tidak ada resep"}
                                                        />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        className="recipe-input recipe-item-qty"
                                                        placeholder="Porsi"
                                                        value={comp.quantity}
                                                        onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="recipe-item-delete"
                                                        onClick={() => handleRemoveComponent(index)}
                                                        title="Hapus komponen"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            className="recipe-add-item-btn"
                                            onClick={handleAddComponent}
                                        >
                                            <Plus size={18} />
                                            Tambah Komponen
                                        </button>
                                    </>
                                )}

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingRecipe ? 'Simpan Perubahan' : 'Tambah Resep'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recipe Detail Modal */}
            {showDetailModal && selectedRecipe && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal modal-lg modal-detail" onClick={(e) => e.stopPropagation()}>
                        {/* Enhanced Header with Gradient */}
                        <div className="relative bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 px-6 py-6 border-b border-white/10">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.3),transparent)]"></div>
                            <button 
                                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-slate-800/50 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10 transition-all z-20" 
                                onClick={() => setShowDetailModal(false)}
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3">
                                    <ChefHat size={32} className="text-primary" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRecipe.name}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="modal-body space-y-6 max-h-[60vh] overflow-y-auto">
                            {/* Description Section */}
                            {selectedRecipe.description && (
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-white/10">
                                    <h4 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                                        <FileText size={18} className="text-primary" />
                                        Deskripsi
                                    </h4>
                                    <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">
                                        {selectedRecipe.description}
                                    </p>
                                </div>
                            )}

                            {/* Video Tutorial */}
                            {selectedRecipe.videoUrl && (
                                <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Video size={18} className="text-red-400" />
                                        Video Tutorial
                                    </h4>
                                    <div className="relative rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedRecipe.videoUrl)}`}
                                            className="absolute top-0 left-0 w-full h-full"
                                            style={{ border: 'none' }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={`Video ${selectedRecipe.name}`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SOP Section */}
                            {selectedRecipe.sop && (
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-white/10">
                                    <h4 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                                        <FileText size={18} className="text-blue-400" />
                                        Standar Operasional Prosedur (SOP)
                                    </h4>
                                    <div className="bg-white dark:bg-slate-900/50 rounded-lg p-4 border border-gray-200 dark:border-white/5">
                                        <div className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                                            {selectedRecipe.sop}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ingredients Section */}
                            {selectedRecipe.ingredientCosts && selectedRecipe.ingredientCosts.length > 0 && (
                                <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl p-5 border border-emerald-500/20">
                                    <h4 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                                        <span className="text-2xl">🥬</span>
                                        Rincian Bahan & Biaya
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedRecipe.ingredientCosts.map((item, index) => (
                                            <div 
                                                key={item.id} 
                                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-white/5 hover:border-emerald-500/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-900 dark:text-white font-medium text-sm">{item.name}</div>
                                                        <div className="text-gray-500 dark:text-slate-400 text-xs">
                                                            {item.quantity} {item.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    {formatCurrency(item.subtotal)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Components Section */}
                            {selectedRecipe.componentCosts && selectedRecipe.componentCosts.length > 0 && (
                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/20">
                                    <h4 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                                        <Layers size={18} className="text-purple-400" />
                                        Resep Komponen
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedRecipe.componentCosts.map((item, index) => (
                                            <div 
                                                key={item.id} 
                                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium text-sm">{item.name}</div>
                                                        <div className="text-slate-400 text-xs">
                                                            {item.quantity} {item.unit}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-purple-400 font-semibold">
                                                    {formatCurrency(item.subtotal)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Total Cost Summary */}
                            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl p-6 border border-primary/30">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-4">
                                    <div className="w-full sm:w-auto">
                                        <div className="text-slate-400 text-sm mb-2">Total HPP ({selectedRecipe.servings} porsi)</div>
                                        <div className="text-3xl font-bold text-primary">
                                            {formatCurrency(selectedRecipe.totalCost)}
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto sm:text-right">
                                        <div className="text-slate-400 text-sm mb-2">Per Porsi</div>
                                        <div className="text-2xl font-bold text-green-400">
                                            {formatCurrency(selectedRecipe.costPerServing)}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            </div>
                        </div>

                        <div className="modal-footer bg-gray-50 dark:bg-slate-800/30 border-t border-gray-200 dark:border-white/10 backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3">
                                <button 
                                    className="px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-slate-700/50 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 transition-all duration-200 text-sm font-medium order-last sm:order-first"
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Tutup
                                </button>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                    <button 
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 text-sm font-medium"
                                        onClick={() => exportRecipeToPDF(selectedRecipe)}
                                        title="Export ke PDF"
                                    >
                                        <Download size={16} /> 
                                        <span>Export PDF</span>
                                    </button>
                                    <button 
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white border border-primary-500/20 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 text-sm font-medium" 
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleOpenModal(selectedRecipe);
                                        }}
                                    >
                                        <Pencil size={16} /> 
                                        <span>Edit Resep</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}

export default Recipes;
