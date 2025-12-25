import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Package, TrendingUp, ArrowRight, UtensilsCrossed, X, Loader2 } from 'lucide-react';
import { statsApi, recipesApi, menusApi } from '../api';
import { DashboardSkeleton } from '../components/Skeleton';

interface Recipe {
  id: number;
  name: string;
  servings: number;
  totalCost: number;
  costPerServing: number;
  ingredients: Array<{
    ingredient: { name: string; unit: string };
    quantity: number;
  }>;
}

interface Menu {
  id: number;
  name: string;
  sellingPrice: number;
  profit: number;
  recipes: Array<{ recipe: { name: string } }>;
}

function Dashboard() {
  const [stats, setStats] = useState({ totalRecipes: 0, totalIngredients: 0, averageHPP: 0 });
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [recentMenus, setRecentMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, recipesRes, menusRes] = await Promise.all([
        statsApi.get(),
        recipesApi.getAll(),
        menusApi.getAll()
      ]);
      setStats(statsRes.data);
      setRecentRecipes(recipesRes.data.slice(0, 5));
      setRecentMenus(menusRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-400">Selamat datang di ResepKu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-hover p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
              <ChefHat size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Total Resep</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecipes}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Bahan Baku</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalIngredients}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Total Menu</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentMenus.length}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Rata-rata HPP</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageHPP)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Menus */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Terbaru</h2>
            <Link to="/menus" className="btn btn-ghost text-sm">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-5">
            {recentMenus.length === 0 ? (
              <div className="empty-state py-8">
                <UtensilsCrossed size={32} className="mb-3 opacity-50" />
                <p className="text-sm mb-4">Belum ada menu</p>
                <Link to="/menus" className="btn btn-primary btn-sm">
                  Tambah Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMenus.map((menu) => (
                  <div 
                    key={menu.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{menu.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400 truncate">
                        {menu.recipes.map(mr => mr.recipe.name).join(', ')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(menu.sellingPrice)}</p>
                      <p className={`text-xs font-medium ${menu.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {menu.profit >= 0 ? '+' : ''}{formatCurrency(menu.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resep Terbaru</h2>
            <Link to="/recipes" className="btn btn-ghost text-sm">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-5">
            {recentRecipes.length === 0 ? (
              <div className="empty-state py-8">
                <ChefHat size={32} className="mb-3 opacity-50" />
                <p className="text-sm mb-4">Belum ada resep</p>
                <Link to="/recipes" className="btn btn-primary btn-sm">
                  Tambah Resep
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{recipe.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {recipe.ingredients.length} bahan • {recipe.servings} porsi
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(recipe.costPerServing)}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">per porsi</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedRecipe.name}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedRecipe(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Jumlah Porsi</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedRecipe.servings} porsi</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Jumlah Bahan</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedRecipe.ingredients?.length || 0} bahan</p>
                </div>
                <div className="p-4 bg-primary-100 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">HPP Total</p>
                  <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(selectedRecipe.totalCost || 0)}</p>
                </div>
                <div className="p-4 bg-primary-100 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">HPP per Porsi</p>
                  <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{formatCurrency(selectedRecipe.costPerServing || 0)}</p>
                </div>
              </div>
              
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-dark-300 mb-3">Bahan-bahan:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.ingredients.map((ri, idx) => (
                      <span key={idx} className="badge badge-secondary">
                        {ri.ingredient?.name} ({ri.quantity} {ri.ingredient?.unit})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRecipe(null)}>
                Tutup
              </button>
              <Link to="/recipes" className="btn btn-primary" onClick={() => setSelectedRecipe(null)}>
                Lihat Semua Resep
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
