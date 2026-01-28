import { Request, Response, NextFunction } from 'express';
import * as superAdminService from '../services/superAdminService';

export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Tidak terautentikasi' });
        }

        const isSuperAdmin = await superAdminService.isSuperAdmin(req.user.id);

        if (!isSuperAdmin) {
            return res.status(403).json({ error: 'Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.' });
        }

        next();
    } catch (error) {
        console.error('Super admin middleware error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
