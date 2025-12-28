import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

// Get all notifications for current user
export const getNotifications = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const unreadOnly = req.query.unread === 'true';
        const notifications = await notificationService.getNotifications(req.user.id, unreadOnly);

        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Gagal mengambil notifikasi' });
    }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const count = await notificationService.getUnreadCount(req.user.id);

        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Gagal mengambil jumlah notifikasi' });
    }
};

// Mark a notification as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const notificationId = parseInt(req.params.id);
        if (isNaN(notificationId)) {
            return res.status(400).json({ error: 'ID notifikasi tidak valid' });
        }

        const success = await notificationService.markAsRead(notificationId, req.user.id);

        if (!success) {
            return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
        }

        res.json({ message: 'Notifikasi ditandai sudah dibaca' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Gagal mengupdate notifikasi' });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const count = await notificationService.markAllAsRead(req.user.id);

        res.json({ message: `${count} notifikasi ditandai sudah dibaca` });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Gagal mengupdate notifikasi' });
    }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const notificationId = parseInt(req.params.id);
        if (isNaN(notificationId)) {
            return res.status(400).json({ error: 'ID notifikasi tidak valid' });
        }

        const success = await notificationService.deleteNotification(notificationId, req.user.id);

        if (!success) {
            return res.status(404).json({ error: 'Notifikasi tidak ditemukan' });
        }

        res.json({ message: 'Notifikasi berhasil dihapus' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Gagal menghapus notifikasi' });
    }
};
