import { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    ArrowUpRight, 
    ArrowDownRight,
    Calendar,
    Package,
    Filter,
    RefreshCw,
    BarChart3,
    Plus,
    Loader2,
    X
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { priceHistoryApi, ingredientsApi } from '../api';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface PriceRecord {
    id: number;
    ingredientId: number;
    purchasePrice: number;
    purchaseUnit: string;
    supplier: string | null;
    notes: string | null;
    recordedAt: string;
    Ingredient: {
        id: number;
        name: string;
        purchaseUnit: string;
        Category?: {
            id: number;
            name: string;
        };
    };
}

interface SummaryItem {
    id: number;
    name: string;
    category: string;
    purchaseUnit: string;
    currentPrice: number;
    previousPrice: number;
    priceChange: number;
    priceChangePercent: number;
    lastUpdated: string;
    historyCount: number;
}

interface Ingredient {
    id: number;
    name: string;
    purchaseUnit: string;
    purchasePrice: number;
}

function PriceHistory() {
    const [view, setView] = useState<'summary' | 'chart' | 'history'>('summary');
    const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);
    const [historyData, setHistoryData] = useState<PriceRecord[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<number>(6); // months
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRecord, setNewRecord] = useState({
        ingredientId: '',
        purchasePrice: '',
        supplier: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedIngredients.length > 0) {
            loadChartData();
        }
    }, [selectedIngredients, timeRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryRes, historyRes, ingredientsRes] = await Promise.all([
                priceHistoryApi.getSummaryReport(),
                priceHistoryApi.getAll(50),
                ingredientsApi.getAll()
            ]);
            setSummaryData(summaryRes.data);
            setHistoryData(historyRes.data);
            setIngredients(ingredientsRes.data);
            
            // Auto-select top 5 ingredients with price changes
            const topChanges = summaryRes.data
                .filter((item: SummaryItem) => item.historyCount > 0)
                .sort((a: SummaryItem, b: SummaryItem) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent))
                .slice(0, 5)
                .map((item: SummaryItem) => item.id);
            setSelectedIngredients(topChanges);
        } catch (error) {
            console.error('Failed to load price history:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadChartData = async () => {
        if (selectedIngredients.length === 0) return;
        
        try {
            const trendsRes = await priceHistoryApi.getTrends(selectedIngredients, timeRange);
            const trends = trendsRes.data;
            
            // Group by ingredient
            const groupedData: { [key: number]: { name: string; data: { date: string; price: number }[] } } = {};
            
            trends.forEach((record: PriceRecord) => {
                if (!groupedData[record.ingredientId]) {
                    groupedData[record.ingredientId] = {
                        name: record.Ingredient?.name || 'Unknown',
                        data: []
                    };
                }
                groupedData[record.ingredientId].data.push({
                    date: new Date(record.recordedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                    price: record.purchasePrice
                });
            });

            // Get all unique dates
            const allDates = [...new Set(trends.map((r: PriceRecord) => 
                new Date(r.recordedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
            ))];

            // Generate chart colors
            const colors = [
                { bg: 'rgba(99, 102, 241, 0.2)', border: 'rgb(99, 102, 241)' },
                { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgb(16, 185, 129)' },
                { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgb(245, 158, 11)' },
                { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgb(239, 68, 68)' },
                { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgb(139, 92, 246)' },
            ];

            const datasets = Object.entries(groupedData).map(([id, data], index) => ({
                label: data.name,
                data: data.data.map(d => d.price),
                borderColor: colors[index % colors.length].border,
                backgroundColor: colors[index % colors.length].bg,
                fill: true,
                tension: 0.4
            }));

            setChartData({
                labels: allDates,
                datasets
            });
        } catch (error) {
            console.error('Failed to load chart data:', error);
        }
    };

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const ingredient = ingredients.find(i => i.id === parseInt(newRecord.ingredientId));
            await priceHistoryApi.create({
                ingredientId: parseInt(newRecord.ingredientId),
                purchasePrice: parseFloat(newRecord.purchasePrice),
                purchaseUnit: ingredient?.purchaseUnit || 'kg',
                supplier: newRecord.supplier || null,
                notes: newRecord.notes || null
            });
            setShowAddModal(false);
            setNewRecord({ ingredientId: '', purchasePrice: '', supplier: '', notes: '' });
            loadData();
        } catch (error) {
            console.error('Failed to add price record:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleIngredientSelection = (id: number) => {
        setSelectedIngredients(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id].slice(0, 5) // Max 5 ingredients
        );
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#9ca3af',
                    font: { size: 12 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: '#9ca3af' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { 
                    color: '#9ca3af',
                    callback: function(value: any) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    // Calculate summary stats
    const priceIncreases = summaryData.filter(s => s.priceChange > 0).length;
    const priceDecreases = summaryData.filter(s => s.priceChange < 0).length;
    const avgChangePercent = summaryData.length > 0 
        ? (summaryData.reduce((sum, s) => sum + s.priceChangePercent, 0) / summaryData.length)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-primary-500" />
                    <p className="text-gray-500 dark:text-dark-400">Memuat data harga...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <TrendingUp className="text-primary-500" />
                        Price History Tracker
                    </h1>
                    <p className="text-gray-500 dark:text-dark-400 mt-1">Monitor dan analisis perubahan harga bahan baku</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary" onClick={loadData}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} />
                        Catat Harga
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/10 text-red-500">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">{priceIncreases}</span>
                        <span className="text-sm text-gray-500 dark:text-dark-400">Harga Naik</span>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500/10 text-emerald-500">
                        <TrendingDown size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">{priceDecreases}</span>
                        <span className="text-sm text-gray-500 dark:text-dark-400">Harga Turun</span>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-500/10 text-primary-500">
                        <BarChart3 size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">{avgChangePercent > 0 ? '+' : ''}{avgChangePercent.toFixed(1)}%</span>
                        <span className="text-sm text-gray-500 dark:text-dark-400">Rata-rata Perubahan</span>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-500/10 text-amber-500">
                        <Package size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">{historyData.length}</span>
                        <span className="text-sm text-gray-500 dark:text-dark-400">Total Catatan</span>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            {/* View Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-dark-700">
                <button 
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        view === 'summary' 
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300'
                    }`}
                    onClick={() => setView('summary')}
                >
                    📊 Ringkasan
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        view === 'chart' 
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300'
                    }`}
                    onClick={() => setView('chart')}
                >
                    📈 Grafik Tren
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        view === 'history' 
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300'
                    }`}
                    onClick={() => setView('history')}
                >
                    📋 Riwayat
                </button>
            </div>

            {/* View Content */}
            {view === 'summary' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Bahan</th>
                                    <th>Kategori</th>
                                    <th>Harga Saat Ini</th>
                                    <th>Harga Sebelumnya</th>
                                    <th>Perubahan</th>
                                    <th>Update Terakhir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-dark-400">/{item.purchaseUnit}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-secondary">{item.category}</span>
                                        </td>
                                        <td className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(item.currentPrice)}
                                        </td>
                                        <td className="text-gray-500 dark:text-dark-400">
                                            {formatCurrency(item.previousPrice)}
                                        </td>
                                        <td>
                                            {item.priceChange !== 0 ? (
                                                <div className={`flex items-center gap-1 text-sm ${item.priceChange > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {item.priceChange > 0 ? (
                                                        <ArrowUpRight size={16} />
                                                    ) : (
                                                        <ArrowDownRight size={16} />
                                                    )}
                                                    <span>
                                                        {item.priceChange > 0 ? '+' : ''}
                                                        {formatCurrency(item.priceChange)}
                                                    </span>
                                                    <span className="opacity-75 ml-1">
                                                        ({item.priceChangePercent > 0 ? '+' : ''}{item.priceChangePercent}%)
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="text-gray-500 dark:text-dark-400 text-sm">
                                            {formatDate(item.lastUpdated)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'chart' && (
                <div className="card p-5">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400">
                            <Filter size={16} />
                            <span>Pilih Bahan (maks. 5):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {ingredients.slice(0, 10).map(ing => (
                                <button
                                    key={ing.id}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        selectedIngredients.includes(ing.id) 
                                            ? 'bg-primary-500 text-white border-primary-600' 
                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-600 hover:border-primary-500'
                                    }`}
                                    onClick={() => toggleIngredientSelection(ing.id)}
                                >
                                    {ing.name}
                                </button>
                            ))}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500 dark:text-dark-400" />
                            <select 
                                value={timeRange} 
                                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                                className="input py-1 text-sm w-32"
                            >
                                <option value={1}>1 Bulan</option>
                                <option value={3}>3 Bulan</option>
                                <option value={6}>6 Bulan</option>
                                <option value={12}>12 Bulan</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="h-[400px]">
                        {chartData && chartData.datasets.length > 0 ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-dark-400 border-2 border-dashed border-gray-200 dark:border-dark-700 rounded-xl bg-gray-50/50 dark:bg-dark-800/30">
                                <BarChart3 size={48} className="mb-2 opacity-50" />
                                <p>Pilih bahan untuk melihat grafik tren harga</p>
                                <p className="text-sm opacity-75">Catatan harga akan ditampilkan di sini</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'history' && (
                <div className="space-y-4">
                    {historyData.length > 0 ? (
                        historyData.map(record => (
                            <div key={record.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <strong className="text-gray-900 dark:text-white">{record.Ingredient?.name}</strong>
                                        {record.Ingredient?.Category && (
                                            <span className="badge badge-secondary text-xs py-0.5">{record.Ingredient.Category.name}</span>
                                        )}
                                    </div>
                                    <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                        {formatCurrency(record.purchasePrice)}
                                        <span className="text-xs text-gray-500 dark:text-dark-400 font-normal ml-1">/{record.purchaseUnit}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-1 text-sm text-gray-500 dark:text-dark-400">
                                    <span className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {formatDate(record.recordedAt)}
                                    </span>
                                    {record.supplier && (
                                        <span className="flex items-center gap-2">
                                            <span>🏪</span> {record.supplier}
                                        </span>
                                    )}
                                    {record.notes && (
                                        <span className="italic text-xs opacity-75">{record.notes}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state py-12">
                            <Package size={48} className="mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum Ada Catatan Harga</h3>
                            <p className="text-sm">Klik "Catat Harga" untuk menambahkan catatan harga baru</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Price Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Catat Harga Baru</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}> <X size={18} /> </button>
                        </div>
                        <form onSubmit={handleAddRecord}>
                            <div className="modal-body space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Bahan *</label>
                                    <select
                                        className="input"
                                        value={newRecord.ingredientId}
                                        onChange={(e) => setNewRecord({ ...newRecord, ingredientId: e.target.value })}
                                        required
                                    >
                                        <option value="">Pilih bahan</option>
                                        {ingredients.map(ing => (
                                            <option key={ing.id} value={ing.id}>
                                                {ing.name} (/{ing.purchaseUnit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Harga Beli (Rp) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={newRecord.purchasePrice}
                                        onChange={(e) => setNewRecord({ ...newRecord, purchasePrice: e.target.value })}
                                        placeholder="30000"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Supplier (opsional)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newRecord.supplier}
                                        onChange={(e) => setNewRecord({ ...newRecord, supplier: e.target.value })}
                                        placeholder="Nama supplier/toko"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">Catatan (opsional)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newRecord.notes}
                                        onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                                        placeholder="Contoh: Promo akhir bulan"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PriceHistory;
