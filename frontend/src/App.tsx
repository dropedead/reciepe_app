import { useState, useEffect, FC, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, ChefHat, Package, Calculator, Tags, UtensilsCrossed, 
  Menu, X, ChevronDown, Database, TrendingUp, Scale, LogOut, User, Users, Sun, Moon 
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import HPPCalculator from './pages/HPPCalculator';
import Categories from './pages/Categories';
import Menus from './pages/Menus';
import PriceHistory from './pages/PriceHistory';
import Units from './pages/Units';
import RecipeCategories from './pages/RecipeCategories';
import MenuCategories from './pages/MenuCategories';
import TeamManagement from './pages/TeamManagement';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import OrganizationSwitcher from './components/OrganizationSwitcher';

// Top Navbar Link Component
const NavbarLink: FC<{
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ to, icon, children }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${isActive 
        ? 'bg-primary-500/10 text-primary-500' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
      }
    `}
    end={to === '/'}
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

// Dropdown Menu for Top Navbar
const NavbarDropdown: FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  childPaths?: string[];
}> = ({ title, icon, children, childPaths = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  const isChildActive = childPaths.some(path => location.pathname === path);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${isChildActive || isOpen
            ? 'bg-primary-500/10 text-primary-500' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span>{title}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
          <div className="py-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Dropdown Item
const DropdownItem: FC<{
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ to, icon, children }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200
      ${isActive 
        ? 'bg-primary-500/10 text-primary-500' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
      }
    `}
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

// Mobile Sidebar Navigation Group
const NavGroup: FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  childPaths?: string[];
}> = ({ title, icon, children, defaultOpen = false, childPaths = [] }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const location = useLocation();
  
  const isChildActive = childPaths.some(path => location.pathname === path);
  
  useEffect(() => {
    if (isChildActive && !isOpen) {
      setIsOpen(true);
    }
  }, [isChildActive, location.pathname]);

  return (
    <div className="mb-1">
      <button 
        type="button"
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
          ${isChildActive 
            ? 'bg-primary-500/10 text-primary-400' 
            : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50 hover:text-gray-900 dark:hover:text-white'
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <span className="flex-1 font-medium">{title}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="pl-4 mt-1 space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile Sidebar Link Component
const SidebarLink: FC<{
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  isChild?: boolean;
}> = ({ to, icon, children, onClick, isChild = false }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
      ${isChild ? 'text-sm' : ''}
      ${isActive 
        ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500' 
        : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50 hover:text-gray-900 dark:hover:text-white'
      }
    `}
    end={to === '/'}
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

// Mobile Sidebar Content
const MobileSidebarContent: FC<{ closeSidebar: () => void }> = ({ closeSidebar }) => {
  return (
    <nav className="flex-1 overflow-y-auto py-4 space-y-1">
      <SidebarLink to="/" icon={<LayoutDashboard size={20} />} onClick={closeSidebar}>
        Dashboard
      </SidebarLink>
      
      <NavGroup 
        title="Master Data" 
        icon={<Database size={20} />} 
        defaultOpen={true}
        childPaths={['/categories', '/ingredients', '/units', '/recipe-categories', '/menu-categories']}
      >
        <SidebarLink to="/ingredients" icon={<Package size={18} />} onClick={closeSidebar} isChild>
          Master Bahan Baku
        </SidebarLink>
        <SidebarLink to="/categories" icon={<Tags size={18} />} onClick={closeSidebar} isChild>
          Kategori Bahan
        </SidebarLink>
        <SidebarLink to="/units" icon={<Scale size={18} />} onClick={closeSidebar} isChild>
          Master Satuan
        </SidebarLink>
        <SidebarLink to="/recipe-categories" icon={<ChefHat size={18} />} onClick={closeSidebar} isChild>
          Kategori Resep
        </SidebarLink>
        <SidebarLink to="/menu-categories" icon={<UtensilsCrossed size={18} />} onClick={closeSidebar} isChild>
          Kategori Menu
        </SidebarLink>
      </NavGroup>

      <SidebarLink to="/recipes" icon={<ChefHat size={20} />} onClick={closeSidebar}>
        Resep
      </SidebarLink>
      <SidebarLink to="/menus" icon={<UtensilsCrossed size={20} />} onClick={closeSidebar}>
        Menu
      </SidebarLink>
      <SidebarLink to="/calculator" icon={<Calculator size={20} />} onClick={closeSidebar}>
        Kalkulator HPP
      </SidebarLink>
      <SidebarLink to="/price-history" icon={<TrendingUp size={20} />} onClick={closeSidebar}>
        Riwayat Harga
      </SidebarLink>
      <SidebarLink to="/team" icon={<Users size={20} />} onClick={closeSidebar}>
        Manajemen Tim
      </SidebarLink>
    </nav>
  );
};

const App: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = (): void => setSidebarOpen(!sidebarOpen);
  const closeSidebar = (): void => setSidebarOpen(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes 
            sidebarOpen={sidebarOpen} 
            toggleSidebar={toggleSidebar} 
            closeSidebar={closeSidebar} 
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppRoutes: FC<{ 
  sidebarOpen: boolean; 
  toggleSidebar: () => void; 
  closeSidebar: () => void; 
}> = ({ sidebarOpen, toggleSidebar, closeSidebar }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8"></div>
          <p className="text-gray-600 dark:text-dark-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Register />
      } />

      {/* Protected routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <OrganizationProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex flex-col">
              {/* Mobile Sidebar Overlay */}
              {sidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/60 z-40 md:hidden"
                  onClick={closeSidebar}
                />
              )}

              {/* Mobile Sidebar Drawer */}
              <aside className={`
                fixed inset-y-0 left-0 z-50 md:hidden
                w-72 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700
                flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xl shadow-glow">
                      🍳
                    </div>
                    <h1 className="text-xl font-bold text-gradient">ResepKu</h1>
                  </div>
                  <button 
                    className="p-2 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                    onClick={closeSidebar}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Organization Switcher */}
                <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                  <OrganizationSwitcher />
                </div>

                {/* Navigation */}
                <MobileSidebarContent closeSidebar={closeSidebar} />

                {/* User Section */}
                <div className="p-4 border-t border-gray-200 dark:border-dark-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-dark-600 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-gray-600 dark:text-dark-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleTheme}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                      <span className="text-xs font-medium">{theme === 'light' ? 'Dark' : 'Light'}</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-xs font-medium">Keluar</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* Top Navbar - Desktop/Tablet */}
              <header className="hidden md:flex sticky top-0 z-40 h-16 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 items-center px-4 lg:px-6">
                {/* Logo */}
                <div className="flex items-center gap-3 mr-8">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-lg shadow-glow">
                    🍳
                  </div>
                  <h1 className="text-lg font-bold text-gradient">ResepKu</h1>
                </div>

                {/* Main Navigation */}
                <nav className="flex items-center gap-1 flex-1">
                  <NavbarLink to="/" icon={<LayoutDashboard size={18} />}>
                    Dashboard
                  </NavbarLink>
                  
                  <NavbarDropdown 
                    title="Master Data" 
                    icon={<Database size={18} />}
                    childPaths={['/categories', '/ingredients', '/units', '/recipe-categories', '/menu-categories']}
                  >
                    <DropdownItem to="/ingredients" icon={<Package size={16} />}>
                      Master Bahan Baku
                    </DropdownItem>
                    <DropdownItem to="/categories" icon={<Tags size={16} />}>
                      Kategori Bahan
                    </DropdownItem>
                    <DropdownItem to="/units" icon={<Scale size={16} />}>
                      Master Satuan
                    </DropdownItem>
                    <DropdownItem to="/recipe-categories" icon={<ChefHat size={16} />}>
                      Kategori Resep
                    </DropdownItem>
                    <DropdownItem to="/menu-categories" icon={<UtensilsCrossed size={16} />}>
                      Kategori Menu
                    </DropdownItem>
                  </NavbarDropdown>

                  <NavbarLink to="/recipes" icon={<ChefHat size={18} />}>
                    Resep
                  </NavbarLink>
                  <NavbarLink to="/menus" icon={<UtensilsCrossed size={18} />}>
                    Menu
                  </NavbarLink>
                  <NavbarLink to="/calculator" icon={<Calculator size={18} />}>
                    Kalkulator HPP
                  </NavbarLink>
                  <NavbarLink to="/price-history" icon={<TrendingUp size={18} />}>
                    Riwayat Harga
                  </NavbarLink>
                  <NavbarLink to="/team" icon={<Users size={18} />}>
                    Tim
                  </NavbarLink>
                </nav>

                {/* Right Section - Organization & User */}
                <div className="flex items-center gap-3">
                  {/* Organization Switcher */}
                  <div className="hidden lg:block">
                    <OrganizationSwitcher variant="compact" />
                  </div>

                  {/* Theme Toggle */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                    title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  </button>

                  {/* User Menu */}
                  <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-dark-700">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      title="Profil Saya"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="hidden lg:block">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{user?.name}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                      title="Keluar"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </header>

              {/* Mobile Header */}
              <header className="md:hidden sticky top-0 z-40 h-14 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between px-4">
                <button 
                  className="p-2 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                  onClick={toggleSidebar}
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍳</span>
                  <span className="font-bold text-gradient">ResepKu</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                  >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-600 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/recipe-categories" element={<RecipeCategories />} />
                  <Route path="/menu-categories" element={<MenuCategories />} />
                  <Route path="/units" element={<Units />} />
                  <Route path="/ingredients" element={<Ingredients />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/menus" element={<Menus />} />
                  <Route path="/calculator" element={<HPPCalculator />} />
                  <Route path="/price-history" element={<PriceHistory />} />
                  <Route path="/team" element={<TeamManagement />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
            </div>
          </OrganizationProvider>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;
