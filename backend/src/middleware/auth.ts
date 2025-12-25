import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../services/authService';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                name: string;
                role: string;
                isVerified: boolean;
                avatar?: string | null;
            };
        }
    }
}

// Auth middleware - verifies JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header or cookie
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Token tidak valid atau sudah expired.' });
        }

        // Get user
        const user = await getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User tidak ditemukan.' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat verifikasi token.' });
    }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : req.cookies?.token;

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                const user = await getUserById(decoded.userId);
                if (user) {
                    req.user = user;
                }
            }
        }
        next();
    } catch {
        next();
    }
};

// Role-based access control
export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Akses ditolak. Silakan login.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk aksi ini.' });
        }

        next();
    };
};

// Require verified email
export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Akses ditolak. Silakan login.' });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({ error: 'Silakan verifikasi email Anda terlebih dahulu.' });
    }

    next();
};
