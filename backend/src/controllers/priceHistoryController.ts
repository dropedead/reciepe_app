import { Request, Response } from 'express';
import priceHistoryService from '../services/priceHistoryService';

class PriceHistoryController {
    // Get all price history
    async getAll(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
            const history = await priceHistoryService.getAll(req.organizationId, limit);
            res.json(history);
        } catch (error) {
            console.error('Error fetching price history:', error);
            res.status(500).json({ error: 'Failed to fetch price history' });
        }
    }

    // Get price history for an ingredient
    async getByIngredient(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const { ingredientId } = req.params;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const history = await priceHistoryService.getByIngredient(ingredientId, req.organizationId, limit);
            res.json(history);
        } catch (error: any) {
            if (error.message === 'Ingredient tidak ditemukan') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Error fetching ingredient price history:', error);
            res.status(500).json({ error: 'Failed to fetch price history' });
        }
    }

    // Get price statistics for an ingredient
    async getStatistics(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const { ingredientId } = req.params;
            const months = req.query.months ? parseInt(req.query.months as string) : 6;
            const stats = await priceHistoryService.getStatistics(ingredientId, req.organizationId, months);
            res.json(stats);
        } catch (error: any) {
            if (error.message === 'Ingredient tidak ditemukan') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Error fetching price statistics:', error);
            res.status(500).json({ error: 'Failed to fetch price statistics' });
        }
    }

    // Get price trends for comparison chart
    async getTrends(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const ingredientIds = req.query.ids
                ? (req.query.ids as string).split(',').map(id => parseInt(id))
                : [];
            const months = req.query.months ? parseInt(req.query.months as string) : 6;

            if (ingredientIds.length === 0) {
                return res.status(400).json({ error: 'Please provide ingredient IDs' });
            }

            const trends = await priceHistoryService.getPriceTrends(ingredientIds, req.organizationId, months);
            res.json(trends);
        } catch (error) {
            console.error('Error fetching price trends:', error);
            res.status(500).json({ error: 'Failed to fetch price trends' });
        }
    }

    // Get summary report
    async getSummaryReport(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const report = await priceHistoryService.getSummaryReport(req.organizationId);
            res.json(report);
        } catch (error) {
            console.error('Error fetching price summary report:', error);
            res.status(500).json({ error: 'Failed to fetch summary report' });
        }
    }

    // Create new price record
    async create(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const record = await priceHistoryService.create(req.body, req.organizationId);
            res.status(201).json(record);
        } catch (error: any) {
            if (error.message === 'Ingredient tidak ditemukan') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Error creating price record:', error);
            res.status(500).json({ error: 'Failed to create price record' });
        }
    }

    // Delete price record
    async delete(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            await priceHistoryService.delete(req.params.id, req.organizationId);
            res.status(204).send();
        } catch (error: any) {
            if (error.message === 'Record tidak ditemukan') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Error deleting price record:', error);
            res.status(500).json({ error: 'Failed to delete price record' });
        }
    }
}

export default new PriceHistoryController();
