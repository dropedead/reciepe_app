import { Request, Response } from 'express';
import * as superAdminService from '../services/superAdminService';

// Get dashboard statistics
export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await superAdminService.getStats();
        const activity = await superAdminService.getUserActivity();

        res.json({
            stats,
            activity
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Gagal mengambil statistik' });
    }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string | undefined;

        const result = await superAdminService.getAllUsers(page, limit, search);

        res.json(result);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Gagal mengambil daftar pengguna' });
    }
};
