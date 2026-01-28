import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, Activity, TrendingUp, 
  Search, ChevronLeft, ChevronRight, RefreshCw,
  Calendar, Clock, Mail, Shield, CheckCircle, XCircle
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  totalUsers: number;
  totalOrganizations: number;
  activeUsers: number;
  newUsersLast7Days: number;
}

interface Activity {
  loginsToday: number;
  loginsYesterday: number;
  loginsLastWeek: number;
  loginsLastMonth: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  provider: string;
  onboardingCompleted: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  organizations: {
    role: string;
    organization: {
      id: number;
      name: string;
    };
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is superadmin
  useEffect(() => {
    if (user && user.role !== 'SUPERADMIN' && user.email !== 'superadmin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/superadmin/stats');
      setStats(response.data.stats);
      setActivity(response.data.activity);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      if (err.response?.status === 403) {
        setError('Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.');
        setTimeout(() => navigate('/'), 2000);
      }
    }
  };

  // Fetch users
  const fetchUsers = async (page: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/users', {
        params: { page, limit: 10, search: searchQuery }
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 403) {
        setError('Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get relative time
  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Belum pernah login';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return `${Math.floor(diffDays / 30)} bulan lalu`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor pengguna dan statistik aplikasi
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Pengguna</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalUsers || 0}
            </p>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{stats?.newUsersLast7Days || 0} minggu ini
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Organisasi</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.totalOrganizations || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">User Aktif (30 hari)</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.activeUsers || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Login Hari Ini</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {activity?.loginsToday || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Kemarin: {activity?.loginsYesterday || 0}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daftar Pengguna
              </h2>
              
              <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau email..."
                    className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full sm:w-64"
                  />
                </form>
                <button
                  onClick={() => { fetchStats(); fetchUsers(pagination.page, search); }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Organisasi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Terdaftar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Login Terakhir
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {user.organizations.length > 0 ? (
                            user.organizations.slice(0, 2).map((org, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-full"
                              >
                                {org.organization.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                          {user.organizations.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-400 rounded-full">
                              +{user.organizations.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getRelativeTime(user.lastLoginAt)}
                          </p>
                          {user.lastLoginAt && (
                            <p className="text-xs text-gray-500">
                              {formatDate(user.lastLoginAt)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          {user.isVerified ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Terverifikasi
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                              <XCircle className="w-4 h-4" />
                              Belum verifikasi
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} pengguna
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchUsers(pagination.page - 1, search)}
                  disabled={pagination.page === 1}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchUsers(pagination.page + 1, search)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
