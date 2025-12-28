import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { notificationsApi, invitationsApi } from '../api';
import { useAuth } from './AuthContext';

export interface Notification {
    id: number;
    userId: number;
    type: 'INVITATION' | 'SYSTEM' | 'INFO';
    title: string;
    message: string;
    data?: {
        invitationId?: number;
        inviterId?: number;
        organizationName?: string;
        role?: string;
        [key: string]: any;
    };
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    acceptInvitation: (notificationId: number, invitationId: number) => Promise<void>;
    declineInvitation: (notificationId: number, invitationId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const [notifRes, countRes] = await Promise.all([
                notificationsApi.getAll(),
                notificationsApi.getUnreadCount()
            ]);
            setNotifications(notifRes.data);
            setUnreadCount(countRes.data.count);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal mengambil notifikasi');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const markAsRead = async (id: number) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal menandai notifikasi');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal menandai semua notifikasi');
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await notificationsApi.delete(id);
            const notif = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notif && !notif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Gagal menghapus notifikasi');
        }
    };

    const acceptInvitation = async (notificationId: number, invitationId: number) => {
        try {
            // Get invitation token first
            const invitationsRes = await invitationsApi.getMyInvitations();
            const myInvitation = invitationsRes.data.find((inv: any) => inv.id === invitationId);
            
            if (!myInvitation) {
                // Invitation not found - might be already accepted or expired
                // Just remove the notification
                await deleteNotification(notificationId);
                throw new Error('Undangan sudah tidak tersedia atau sudah diterima sebelumnya');
            }
            
            await invitationsApi.accept(myInvitation.token);
            
            // Delete the notification after accepting
            await deleteNotification(notificationId);
        } catch (err: any) {
            // If notification still exists, remove it from the UI to avoid confusion
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            throw new Error(err.response?.data?.error || err.message || 'Gagal menerima undangan');
        }
    };

    const declineInvitation = async (notificationId: number, invitationId: number) => {
        try {
            // Get invitation token first
            const invitationsRes = await invitationsApi.getMyInvitations();
            const myInvitation = invitationsRes.data.find((inv: any) => inv.id === invitationId);
            
            if (!myInvitation) {
                // Invitation not found - might be already processed
                // Just remove the notification
                await deleteNotification(notificationId);
                throw new Error('Undangan sudah tidak tersedia');
            }
            
            await invitationsApi.decline(myInvitation.token);
            
            // Delete the notification after declining
            await deleteNotification(notificationId);
        } catch (err: any) {
            // If notification still exists, remove it from the UI to avoid confusion
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            throw new Error(err.response?.data?.error || err.message || 'Gagal menolak undangan');
        }
    };

    // Fetch notifications when user logs in
    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, fetchNotifications]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!user) return;
        
        const interval = setInterval(() => {
            notificationsApi.getUnreadCount().then(res => {
                setUnreadCount(res.data.count);
            }).catch(() => {});
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    return (
        <NotificationContext.Provider value={{
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
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
