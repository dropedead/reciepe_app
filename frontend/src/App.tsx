import { useState, useEffect, FC, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ChefHat, Package, Calculator, Tags, UtensilsCrossed, 
  Menu, X, ChevronDown, Database, TrendingUp, Scale, LogOut, User, Users, Sun, Moon, Gift, Sparkles, Bell, Book, Settings 
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
import MenuBundling from './pages/MenuBundling';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Notifications from './pages/Notifications';
import Documentation from './pages/Documentation';
import OrganizationSettings from './pages/OrganizationSettings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import OrganizationSwitcher from './components/OrganizationSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';

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
  const { t } = useLanguage();
  return (
    <nav className="flex-1 overflow-y-auto py-4 space-y-1">
      <SidebarLink to="/" icon={<LayoutDashboard size={20} />} onClick={closeSidebar}>
        {t.nav.dashboard}
      </SidebarLink>
      
      {/* Menu Lab Group */}
      <NavGroup 
        title="Menu Lab"
        icon={<ChefHat size={20} />} 
        defaultOpen={true}
        childPaths={['/recipes', '/menus', '/calculator', '/price-history']}
      >
        <SidebarLink to="/recipes" icon={<ChefHat size={18} />} onClick={closeSidebar} isChild>
          {t.nav.recipes}
        </SidebarLink>
        <SidebarLink to="/menus" icon={<UtensilsCrossed size={18} />} onClick={closeSidebar} isChild>
          {t.nav.menus}
        </SidebarLink>
        <SidebarLink to="/calculator" icon={<Calculator size={18} />} onClick={closeSidebar} isChild>
          {t.nav.hppCalculator}
        </SidebarLink>
        <SidebarLink to="/price-history" icon={<TrendingUp size={18} />} onClick={closeSidebar} isChild>
          {t.nav.priceHistory}
        </SidebarLink>
      </NavGroup>

      {/* Master Data Group */}
      <NavGroup 
        title={t.nav.masterData}
        icon={<Database size={20} />} 
        defaultOpen={false}
        childPaths={['/categories', '/ingredients', '/units', '/recipe-categories', '/menu-categories']}
      >
        <SidebarLink to="/ingredients" icon={<Package size={18} />} onClick={closeSidebar} isChild>
          {t.nav.ingredients}
        </SidebarLink>
        <SidebarLink to="/categories" icon={<Tags size={18} />} onClick={closeSidebar} isChild>
          {t.nav.categories}
        </SidebarLink>
        <SidebarLink to="/units" icon={<Scale size={18} />} onClick={closeSidebar} isChild>
          {t.nav.units}
        </SidebarLink>
        <SidebarLink to="/recipe-categories" icon={<ChefHat size={18} />} onClick={closeSidebar} isChild>
          {t.nav.recipeCategories}
        </SidebarLink>
        <SidebarLink to="/menu-categories" icon={<UtensilsCrossed size={18} />} onClick={closeSidebar} isChild>
          {t.nav.menuCategories}
        </SidebarLink>
      </NavGroup>

      {/* Promosi Group */}
      <NavGroup 
        title={t.nav.promotions}
        icon={<Sparkles size={20} />} 
        defaultOpen={false}
        childPaths={['/bundling']}
      >
        <SidebarLink to="/bundling" icon={<Gift size={18} />} onClick={closeSidebar} isChild>
          {t.nav.bundling}
        </SidebarLink>
      </NavGroup>

      {/* Lainnya Group */}
      <NavGroup 
        title="Lainnya"
        icon={<Users size={20} />} 
        defaultOpen={false}
        childPaths={['/team', '/organization-settings', '/notifications', '/docs']}
      >
        <SidebarLink to="/team" icon={<Users size={18} />} onClick={closeSidebar} isChild>
          {t.nav.team}
        </SidebarLink>
        <SidebarLink to="/organization-settings" icon={<Settings size={18} />} onClick={closeSidebar} isChild>
          Pengaturan Organisasi
        </SidebarLink>
        <SidebarLink to="/notifications" icon={<Bell size={18} />} onClick={closeSidebar} isChild>
          Notifikasi
        </SidebarLink>
        <SidebarLink to="/docs" icon={<Book size={18} />} onClick={closeSidebar} isChild>
          Panduan
        </SidebarLink>
      </NavGroup>
    </nav>
  );
};

// Notification Bell Component with Dropdown
const NotificationBell: FC = () => {
  const { notifications, unreadCount, markAsRead, acceptInvitation, declineInvitation } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m lalu`;
    if (hours < 24) return `${hours}j lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const handleAccept = async (notificationId: number, invitationId: number) => {
    setActionLoading(notificationId);
    try {
      await acceptInvitation(notificationId, invitationId);
      setIsOpen(false);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (notificationId: number, invitationId: number) => {
    setActionLoading(notificationId);
    try {
      await declineInvitation(notificationId, invitationId);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
        title="Notifikasi"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-primary-500 font-medium">{unreadCount} baru</span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-dark-400">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada notifikasi</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-dark-700 last:border-0 ${
                    !notif.isRead ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''
                  }`}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'INVITATION' ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-dark-700'
                    }`}>
                      <Users size={14} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        {notif.title}
                        {!notif.isRead && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-dark-400 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                        {formatDate(notif.createdAt)}
                      </p>

                      {/* Invitation Actions */}
                      {notif.type === 'INVITATION' && notif.data?.invitationId && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAccept(notif.id, notif.data!.invitationId!); }}
                            disabled={actionLoading === notif.id}
                            className="px-3 py-1 text-xs font-medium bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                          >
                            Terima
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDecline(notif.id, notif.data!.invitationId!); }}
                            disabled={actionLoading === notif.id}
                            className="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-dark-500 disabled:opacity-50"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - View All Link */}
          <Link 
            to="/notifications" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium text-primary-500 hover:bg-gray-50 dark:hover:bg-dark-700 border-t border-gray-100 dark:border-dark-700"
          >
            Lihat Semua Notifikasi
          </Link>
        </div>
      )}
    </div>
  );
};

const App: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = (): void => setSidebarOpen(!sidebarOpen);
  const closeSidebar = (): void => setSidebarOpen(false);

  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
};

const AppRoutes: FC<{ 
  sidebarOpen: boolean; 
  toggleSidebar: () => void; 
  closeSidebar: () => void; 
}> = ({ sidebarOpen, toggleSidebar, closeSidebar }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8"></div>
          <p className="text-gray-600 dark:text-dark-400">{t.actions.loading}</p>
        </div>
      </div>
    );
  }

  // Check if user needs onboarding
  const needsOnboarding = user && user.onboardingCompleted === false;

  return (
    <Routes>
      {/* Landing page - Public route */}
      <Route path="/welcome" element={
        isAuthenticated 
          ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/" replace />)
          : <LandingPage />
      } />
      
      {/* Auth routes */}
      <Route path="/login" element={
        isAuthenticated 
          ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/" replace />)
          : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated 
          ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/" replace />)
          : <Register />
      } />

      {/* Onboarding route */}
      <Route path="/onboarding" element={
        !isAuthenticated 
          ? <Navigate to="/welcome" replace />
          : (!needsOnboarding ? <Navigate to="/" replace /> : <Onboarding />)
      } />

      {/* Protected routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <OrganizationProvider>
            <NotificationProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex">
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
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </aside>

              {/* Desktop Sidebar - Fixed Left */}
              <aside className="hidden md:flex md:w-64 lg:w-72 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 flex-col fixed inset-y-0 left-0 z-30">
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-xl shadow-glow">
                      🍳
                    </div>
                    <h1 className="text-xl font-bold text-gradient">ResepKu</h1>
                  </div>
                </div>

                {/* Organization Switcher */}
                <div className="p-3 border-b border-gray-200 dark:border-dark-700">
                  <OrganizationSwitcher />
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                  <NavLink 
                    to="/" 
                    end
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-primary-500/10 text-primary-500 border-l-2 border-primary-500' 
                        : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">{t.nav.dashboard}</span>
                  </NavLink>

                  {/* Menu Lab Group */}
                  <div className="pt-4">
                    <p className="px-3 text-xs font-semibold text-gray-400 dark:text-dark-500 uppercase tracking-wider mb-2">
                      Menu Lab
                    </p>
                    <NavLink to="/recipes" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <ChefHat size={18} />
                      <span>{t.nav.recipes}</span>
                    </NavLink>
                    <NavLink to="/menus" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <UtensilsCrossed size={18} />
                      <span>{t.nav.menus}</span>
                    </NavLink>
                    <NavLink to="/calculator" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Calculator size={18} />
                      <span>{t.nav.hppCalculator}</span>
                    </NavLink>
                    <NavLink to="/price-history" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <TrendingUp size={18} />
                      <span>{t.nav.priceHistory}</span>
                    </NavLink>
                  </div>

                  {/* Master Data Group */}
                  <div className="pt-4">
                    <p className="px-3 text-xs font-semibold text-gray-400 dark:text-dark-500 uppercase tracking-wider mb-2">
                      {t.nav.masterData}
                    </p>
                    <NavLink to="/ingredients" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Package size={18} />
                      <span>{t.nav.ingredients}</span>
                    </NavLink>
                    <NavLink to="/categories" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Tags size={18} />
                      <span>{t.nav.categories}</span>
                    </NavLink>
                    <NavLink to="/units" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Scale size={18} />
                      <span>{t.nav.units}</span>
                    </NavLink>
                    <NavLink to="/recipe-categories" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <ChefHat size={18} />
                      <span>{t.nav.recipeCategories}</span>
                    </NavLink>
                    <NavLink to="/menu-categories" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <UtensilsCrossed size={18} />
                      <span>{t.nav.menuCategories}</span>
                    </NavLink>
                  </div>

                  {/* Promotions Group */}
                  <div className="pt-4">
                    <p className="px-3 text-xs font-semibold text-gray-400 dark:text-dark-500 uppercase tracking-wider mb-2">
                      {t.nav.promotions}
                    </p>
                    <NavLink to="/bundling" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Gift size={18} />
                      <span>{t.nav.bundling}</span>
                    </NavLink>
                  </div>

                  {/* Others */}
                  <div className="pt-4">
                    <p className="px-3 text-xs font-semibold text-gray-400 dark:text-dark-500 uppercase tracking-wider mb-2">
                      Lainnya
                    </p>
                    <NavLink to="/team" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Users size={18} />
                      <span>{t.nav.team}</span>
                    </NavLink>
                    <NavLink to="/organization-settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Settings size={18} />
                      <span>Pengaturan Organisasi</span>
                    </NavLink>
                    <NavLink to="/docs" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-700/50'}`}>
                      <Book size={18} />
                      <span>Panduan</span>
                    </NavLink>
                  </div>
                </nav>

                {/* User Section at Bottom */}
                <div className="p-3 border-t border-gray-200 dark:border-dark-700">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400 truncate">{user?.email}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 mt-2">
                    <LanguageSwitcher variant="compact" />
                    <button 
                      onClick={toggleTheme}
                      className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                      title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
                    >
                      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-gray-500 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col md:ml-64 lg:ml-72">
                {/* Desktop Top Bar */}
                <header className="hidden md:flex sticky top-0 z-20 h-14 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 items-center justify-end px-4 lg:px-6 gap-3">
                  {/* Notification Bell */}
                  <NotificationBell />
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
                    <NotificationBell />
                    <button 
                      onClick={toggleTheme}
                      className="p-2 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                    >
                      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                  </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/recipe-categories" element={<RecipeCategories />} />
                    <Route path="/menu-categories" element={<MenuCategories />} />
                    <Route path="/units" element={<Units />} />
                    <Route path="/ingredients" element={<Ingredients />} />
                    <Route path="/recipes" element={<Recipes />} />
                    <Route path="/menus" element={<Menus />} />
                    <Route path="/bundling" element={<MenuBundling />} />
                    <Route path="/calculator" element={<HPPCalculator />} />
                    <Route path="/price-history" element={<PriceHistory />} />
                    <Route path="/team" element={<TeamManagement />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/docs" element={<Documentation />} />
                    <Route path="/organization-settings" element={<OrganizationSettings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </NotificationProvider>
          </OrganizationProvider>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;
