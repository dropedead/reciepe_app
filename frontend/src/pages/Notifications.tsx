import { useState } from 'react';
import { 
    Bell, Check, CheckCheck, Trash2, Users, Info, AlertCircle, 
    Loader2, RefreshCw, Mail, History, Inbox
} from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const navigate = useNavigate();
    const { 
        notifications, 
        unreadCount, 
        isLoading, 
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        acceptInvitation,
        declineInvitation
    } = useNotifications();
    
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'INVITATION':
                return <Users size={20} className="text-primary-500" />;
            case 'SYSTEM':
                return <AlertCircle size={20} className="text-amber-500" />;
            default:
                return <Info size={20} className="text-blue-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days < 7) return `${days} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleAccept = async (notification: Notification) => {
        if (!notification.data?.invitationId) return;
        
        setActionLoading(notification.id);
        setActionError(null);
        try {
            await acceptInvitation(notification.id, notification.data.invitationId);
            navigate('/');
        } catch (err: any) {
            setActionError(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (notification: Notification) => {
        if (!notification.data?.invitationId) return;
        
        setActionLoading(notification.id);
        setActionError(null);
        try {
            await declineInvitation(notification.id, notification.data.invitationId);
        } catch (err: any) {
            setActionError(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus notifikasi ini?')) return;
        await deleteNotification(id);
    };

    // Filter notifications based on active tab
    const filteredNotifications = activeTab === 'unread' 
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                        <Bell size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
                        <p className="text-sm text-gray-500 dark:text-dark-400">
                            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchNotifications}
                        className="btn btn-ghost btn-icon"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="btn btn-secondary text-sm"
                        >
                            <CheckCheck size={16} />
                            Tandai Semua Dibaca
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-700 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('unread')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'unread'
                            ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <Inbox size={16} />
                    Baru
                    {unreadNotifications.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                            {unreadNotifications.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'all'
                            ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <History size={16} />
                    Semua Histori
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-dark-500 text-gray-600 dark:text-dark-300 rounded-full">
                        {notifications.length}
                    </span>
                </button>
            </div>

            {/* Error Alert */}
            {(error || actionError) && (
                <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <span>{error || actionError}</span>
                </div>
            )}

            {/* Notifications List */}
            <div className="card">
                {isLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-primary-500" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="empty-state py-12">
                        <Mail size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {activeTab === 'unread' ? 'Tidak Ada Notifikasi Baru' : 'Tidak Ada Notifikasi'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-dark-400">
                            {activeTab === 'unread' 
                                ? 'Semua notifikasi sudah dibaca' 
                                : 'Anda akan menerima notifikasi ketika ada undangan tim atau pembaruan penting'}
                        </p>
                        {activeTab === 'unread' && readNotifications.length > 0 && (
                            <button
                                onClick={() => setActiveTab('all')}
                                className="btn btn-secondary btn-sm mt-4"
                            >
                                <History size={14} />
                                Lihat Histori
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-dark-700">
                        {filteredNotifications.map((notification) => (
                            <div 
                                key={notification.id}
                                className={`p-4 transition-colors ${
                                    !notification.isRead 
                                        ? 'bg-primary-50/50 dark:bg-primary-500/5' 
                                        : 'hover:bg-gray-50 dark:hover:bg-dark-700/50'
                                }`}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        notification.type === 'INVITATION' 
                                            ? 'bg-primary-100 dark:bg-primary-500/20' 
                                            : 'bg-gray-100 dark:bg-dark-700'
                                    }`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                    {notification.title}
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 bg-primary-500 rounded-full" />
                                                    )}
                                                    {notification.isRead && (
                                                        <span className="text-xs font-normal text-gray-400 dark:text-dark-500">Dibaca</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-dark-300 mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                                                    {formatDate(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Delete button for all notifications */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!notification.isRead && notification.type !== 'INVITATION' && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="btn btn-ghost btn-icon text-gray-400 hover:text-primary-500"
                                                        title="Tandai sudah dibaca"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="btn btn-ghost btn-icon text-gray-400 hover:text-red-500"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Invitation Actions - only show if not read */}
                                        {notification.type === 'INVITATION' && notification.data?.invitationId && !notification.isRead && (
                                            <div className="flex items-center gap-2 mt-3">
                                                <button
                                                    onClick={() => handleAccept(notification)}
                                                    disabled={actionLoading === notification.id}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    {actionLoading === notification.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Check size={14} />
                                                    )}
                                                    Terima
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(notification)}
                                                    disabled={actionLoading === notification.id}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        )}

                                        {/* Show status for processed invitations in history */}
                                        {notification.type === 'INVITATION' && notification.isRead && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-500 dark:text-dark-400 italic">
                                                    Undangan sudah diproses
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
