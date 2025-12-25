import { Request, Response } from 'express';
import unitMasterService from '../services/unitMasterService';

class UnitMasterController {
    // Get all units
    async getAll(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const units = await unitMasterService.getAll(req.organizationId);
            res.json(units);
        } catch (error) {
            console.error('Error fetching units:', error);
            res.status(500).json({ error: 'Gagal mengambil data satuan' });
        }
    }

    // Get all units grouped by type
    async getAllGrouped(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const grouped = await unitMasterService.getAllGrouped(req.organizationId);
            res.json(grouped);
        } catch (error) {
            console.error('Error fetching grouped units:', error);
            res.status(500).json({ error: 'Gagal mengambil data satuan' });
        }
    }

    // Get purchase units
    async getPurchaseUnits(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const units = await unitMasterService.getPurchaseUnits(req.organizationId);
            res.json(units);
        } catch (error) {
            console.error('Error fetching purchase units:', error);
            res.status(500).json({ error: 'Gagal mengambil data satuan pembelian' });
        }
    }

    // Get usage units
    async getUsageUnits(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const units = await unitMasterService.getUsageUnits(req.organizationId);
            res.json(units);
        } catch (error) {
            console.error('Error fetching usage units:', error);
            res.status(500).json({ error: 'Gagal mengambil data satuan pemakaian' });
        }
    }

    // Get compatible usage units for purchase unit
    async getCompatibleUnits(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const { purchaseUnit } = req.params;
            const units = await unitMasterService.getCompatibleUnits(req.organizationId, purchaseUnit);
            res.json(units);
        } catch (error) {
            console.error('Error fetching compatible units:', error);
            res.status(500).json({ error: 'Gagal mengambil data satuan kompatibel' });
        }
    }

    // Get single unit by ID
    async getById(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const unit = await unitMasterService.getById(req.params.id, req.organizationId);
            if (!unit) {
                return res.status(404).json({ error: 'Satuan tidak ditemukan' });
            }
            res.json(unit);
        } catch (error) {
            console.error('Error fetching unit:', error);
            res.status(500).json({ error: 'Gagal mengambil data satuan' });
        }
    }

    // Create new unit
    async create(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }

            const { name, label, group, baseValue, isBaseUnit, isPurchaseUnit, isUsageUnit, description } = req.body;

            if (!name || !label || !group) {
                return res.status(400).json({ error: 'Nama, label, dan grup satuan wajib diisi' });
            }

            if (!['mass', 'volume', 'count'].includes(group)) {
                return res.status(400).json({ error: 'Grup satuan harus berupa mass, volume, atau count' });
            }

            const unit = await unitMasterService.create({
                name,
                label,
                group,
                baseValue,
                isBaseUnit,
                isPurchaseUnit,
                isUsageUnit,
                description
            }, req.organizationId);

            res.status(201).json(unit);
        } catch (error: any) {
            console.error('Error creating unit:', error);
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'Satuan dengan nama tersebut sudah ada' });
            }
            res.status(500).json({ error: 'Gagal membuat satuan baru' });
        }
    }

    // Update unit
    async update(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }

            const { id } = req.params;
            const { name, label, group, baseValue, isBaseUnit, isPurchaseUnit, isUsageUnit, description } = req.body;

            if (group && !['mass', 'volume', 'count'].includes(group)) {
                return res.status(400).json({ error: 'Grup satuan harus berupa mass, volume, atau count' });
            }

            const unit = await unitMasterService.update(id, {
                name,
                label,
                group,
                baseValue,
                isBaseUnit,
                isPurchaseUnit,
                isUsageUnit,
                description
            }, req.organizationId);

            res.json(unit);
        } catch (error: any) {
            console.error('Error updating unit:', error);
            if (error.message === 'Unit tidak ditemukan') {
                return res.status(404).json({ error: error.message });
            }
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'Satuan dengan nama tersebut sudah ada' });
            }
            res.status(500).json({ error: 'Gagal mengupdate satuan' });
        }
    }

    // Delete unit
    async delete(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const { id } = req.params;
            await unitMasterService.delete(id, req.organizationId);
            res.json({ message: 'Satuan berhasil dihapus' });
        } catch (error: any) {
            console.error('Error deleting unit:', error);
            if (error.message === 'Unit tidak ditemukan') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Gagal menghapus satuan' });
        }
    }

    // Seed default units for organization
    async seedDefaults(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            await unitMasterService.seedDefaultUnits(req.organizationId);
            res.json({ message: 'Default units seeded successfully' });
        } catch (error) {
            console.error('Error seeding units:', error);
            res.status(500).json({ error: 'Gagal seed satuan default' });
        }
    }

    // Get conversion rate
    async getConversionRate(req: Request, res: Response) {
        try {
            if (!req.organizationId) {
                return res.status(400).json({ error: 'Organization context required' });
            }
            const { fromUnit, toUnit, packageSize } = req.query;

            if (!fromUnit || !toUnit) {
                return res.status(400).json({ error: 'fromUnit dan toUnit wajib diisi' });
            }

            const rate = await unitMasterService.getConversionRate(
                req.organizationId,
                fromUnit as string,
                toUnit as string,
                packageSize ? parseFloat(packageSize as string) : 1
            );

            res.json({
                fromUnit,
                toUnit,
                packageSize: packageSize || 1,
                conversionRate: rate,
                description: `1 ${fromUnit} = ${rate} ${toUnit}`
            });
        } catch (error) {
            console.error('Error calculating conversion:', error);
            res.status(500).json({ error: 'Gagal menghitung konversi satuan' });
        }
    }
}

export default new UnitMasterController();
