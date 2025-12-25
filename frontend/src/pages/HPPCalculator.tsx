import { useState, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, DollarSign, ChefHat, Info, ChevronDown, Check, Package } from 'lucide-react';
import { menusApi } from '../api';

interface MenuRecipeCost {
    recipeId: number;
    recipeName: string;
    quantity: number;
    costPerServing: number;
    subtotal: number;
}

interface MenuDetail {
    id: number;
    name: string;
    sellingPrice: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
    recipesCost: MenuRecipeCost[];
}

interface Menu {
    id: number;
    name: string;
    sellingPrice: number;
    totalCost: number;
}

function HPPCalculator() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [selectedMenuId, setSelectedMenuId] = useState('');
    const [selectedMenu, setSelectedMenu] = useState<MenuDetail | null>(null);
    const [profitMargin, setProfitMargin] = useState(30);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMenus();
    }, []);

    useEffect(() => {
        if (selectedMenuId) {
            loadMenuDetail(selectedMenuId);
        } else {
            setSelectedMenu(null);
        }
    }, [selectedMenuId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadMenus = async () => {
        try {
            const res = await menusApi.getAll();
            setMenus(res.data);
        } catch (error) {
            console.error('Failed to load menus:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMenuDetail = async (id: string) => {
        try {
            const res = await menusApi.getById(parseInt(id));
            const data = res.data;
            setSelectedMenu(data);
            // Default margin to current margin from data if valid
            if (data.profitMargin > 0) {
                setProfitMargin(Math.round(data.profitMargin));
            }
        } catch (error) {
            console.error('Failed to load menu detail:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const calculateSellingPrice = (cost: number, margin: number) => {
        if (margin >= 100) return 0;
        return cost / (1 - margin / 100);
    };

    const calculateProfit = (cost: number, margin: number) => {
        const sellingPrice = calculateSellingPrice(cost, margin);
        return sellingPrice - cost;
    };

    const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value);
        if (isNaN(value)) value = 0;
        if (value > 99) value = 99;
        setProfitMargin(value);
    };

    const handleMenuSelect = (id: string) => {
        setSelectedMenuId(id);
        setIsDropdownOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="spinner w-8 h-8"></div>
            </div>
        );
    }

    const selectedMenuName = menus.find(m => m.id.toString() === selectedMenuId)?.name;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <Calculator className="text-primary-500" />
                    Kalkulator HPP Menu
                </h1>
                <p className="text-gray-500 dark:text-dark-400">
                    Hitung Harga Pokok Penjualan (HPP) total untuk item menu Anda dan simulasi profit margin.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* Left Column: Menu Selection & Breakdown */}
                <div className="space-y-6">
                    <div className="card p-6 border border-gray-100 dark:border-dark-700 shadow-sm hover:shadow-md transition-shadow relative z-20 !overflow-visible !backdrop-blur-none">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-dark-700">
                            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                                <Package size={20} className="text-primary-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pilih Menu</h3>
                                <p className="text-sm text-gray-500 dark:text-dark-400">Pilih item menu untuk dianalisis</p>
                            </div>
                        </div>

                        <div className="form-control" ref={dropdownRef}>
                            <label className="label">
                                <span className="label-text font-medium text-gray-700 dark:text-dark-300">Menu</span>
                            </label>
                            
                            {/* Custom Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 
                                        bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg
                                        text-gray-900 dark:text-white hover:border-primary-500 transition-all duration-200
                                        ${isDropdownOpen ? 'border-primary-500 ring-2 ring-primary-500/10' : ''}
                                    `}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className={`block truncate ${!selectedMenuId ? 'text-gray-400 dark:text-dark-400' : ''}`}>
                                        {selectedMenuName || '-- Pilih menu --'}
                                    </span>
                                    <ChevronDown 
                                        size={18} 
                                        className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                                        <div className="max-h-64 overflow-y-auto py-2">
                                            {menus.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400 italic">
                                                    Tidak ada menu tersedia
                                                </div>
                                            ) : (
                                                menus.map(menu => (
                                                    <button
                                                        key={menu.id}
                                                        type="button"
                                                        className={`
                                                            w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                                                            hover:bg-gray-50 dark:hover:bg-dark-700/50
                                                            ${selectedMenuId === menu.id.toString() 
                                                                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' 
                                                                : 'text-gray-700 dark:text-gray-300'}
                                                        `}
                                                        onClick={() => handleMenuSelect(menu.id.toString())}
                                                    >
                                                        <span>{menu.name}</span>
                                                        {selectedMenuId === menu.id.toString() && (
                                                            <Check size={16} className="text-primary-500" />
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedMenu && (
                            <div className="mt-8 animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Info size={16} className="text-gray-400" />
                                        Komposisi Resep
                                    </h4>
                                    <span className="badge badge-secondary badge-outline text-xs">
                                        {selectedMenu.recipesCost.length} Resep
                                    </span>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-dark-800/50 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-dark-700/50">
                                    {selectedMenu.recipesCost.map((item) => (
                                        <div key={item.recipeId} className="flex justify-between items-start py-2 border-b border-dashed border-gray-200 dark:border-dark-600 last:border-0 last:pb-0 font-mono text-sm">
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200">{item.recipeName}</div>
                                                <div className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                                                    {item.quantity} porsi × {formatCurrency(item.costPerServing)}
                                                </div>
                                            </div>
                                            <div className="font-medium text-gray-700 dark:text-dark-300">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl border border-primary-100 dark:border-primary-500/20 flex justify-between items-center">
                                    <span className="font-semibold text-primary-700 dark:text-primary-300">Total HPP Menu</span>
                                    <span className="text-lg font-bold text-primary-700 dark:text-primary-400">{formatCurrency(selectedMenu.totalCost)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Profit Calculator */}
                <div className="space-y-6">
                    <div className="card p-6 border border-gray-100 dark:border-dark-700 shadow-sm hover:shadow-md transition-shadow h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-dark-700">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                                <TrendingUp size={20} className="text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Simulasi Keuntungan</h3>
                                <p className="text-sm text-gray-500 dark:text-dark-400">Atur margin untuk melihat potensi profit</p>
                            </div>
                        </div>

                        {!selectedMenu ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center h-64 border-2 border-dashed border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50/50 dark:bg-dark-800/30">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4">
                                    <DollarSign className="text-gray-400 dark:text-dark-400" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Belum ada menu dipilih</h3>
                                <p className="text-sm text-gray-500 dark:text-dark-400 max-w-[250px]">
                                    Pilih item menu di panel sebelah kiri untuk mulai simulasi
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in">
                                {/* Margin Control used input range and number */}
                                <div>
                                    <label className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-700 dark:text-dark-300">Margin Keuntungan</span>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                className="input input-sm w-20 text-right pr-2 font-bold text-green-600"
                                                value={profitMargin}
                                                onChange={handleMarginChange}
                                                min="0"
                                                max="99"
                                            />
                                            <span className="text-gray-500 dark:text-dark-400">%</span>
                                        </div>
                                    </label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="80"
                                        value={profitMargin}
                                        onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                                        className="range range-success w-full range-sm" // using fluid range
                                        style={{ accentColor: '#22c55e' }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                                        <span>5% (Min)</span>
                                        <span>80% (Max)</span>
                                    </div>
                                </div>

                                {/* Calculation Details */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                                        <span className="text-gray-600 dark:text-dark-300">Total HPP</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedMenu.totalCost)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-3 rounded-lg bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-700 dark:text-green-400 font-medium">Potensi Keuntungan</span>
                                            <span className="text-xs bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded-md font-bold">
                                                +{profitMargin}%
                                            </span>
                                        </div>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            +{formatCurrency(calculateProfit(selectedMenu.totalCost, profitMargin))}
                                        </span>
                                    </div>

                                    <div className="border-t-2 border-dashed border-gray-200 dark:border-dark-600 my-4"></div>

                                    <div className="flex flex-col gap-1 p-4 bg-gray-900 dark:bg-black rounded-xl text-white shadow-xl transform transition-transform hover:scale-[1.02]">
                                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Rekomendasi Harga Jual</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold tracking-tight">
                                                {formatCurrency(calculateSellingPrice(selectedMenu.totalCost, profitMargin))}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2 p-2 bg-white/5 rounded-md border border-white/10 flex items-center gap-2">
                                            <DollarSign size={14} className="text-primary-400" />
                                            <span>Harga saat ini di menu: <strong className="text-white">{formatCurrency(selectedMenu.sellingPrice)}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-500/20">
                                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                                        <Info size={16} />
                                        Panduan Margin
                                    </h4>
                                    <ul className="space-y-1 text-blue-600 dark:text-blue-400 list-disc list-inside">
                                        <li><span className="font-semibold">20-30%</span>: Kompetitif/Pasar umum</li>
                                        <li><span className="font-semibold">30-50%</span>: Standar Resto/Cafe</li>
                                        <li><span className="font-semibold">50%+</span>: Produk Premium/Spesial</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HPPCalculator;
