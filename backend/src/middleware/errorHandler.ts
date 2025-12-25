import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code) {
        switch (err.code) {
            case 'P2002':
                res.status(400).json({
                    error: 'Data sudah ada dalam database',
                    details: err.meta
                });
                return;
            case 'P2003':
                res.status(400).json({
                    error: 'Data masih digunakan oleh data lain',
                    details: err.meta
                });
                return;
            case 'P2025':
                res.status(404).json({
                    error: 'Data tidak ditemukan'
                });
                return;
            default:
                break;
        }
    }

    // Default error
    res.status(500).json({
        error: err.message || 'Internal server error'
    });
};

export default errorHandler;
