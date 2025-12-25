import prisma from '../config/database';

interface UnitData {
    name: string;
    label: string;
    group: string;
    baseValue?: number;
    isBaseUnit?: boolean;
    isPurchaseUnit?: boolean;
    isUsageUnit?: boolean;
    description?: string;
}

// Default units to seed per organization
const DEFAULT_UNITS: UnitData[] = [
    // Mass units (base: gram)
    { name: 'gram', label: 'Gram (g)', group: 'mass', baseValue: 1, isBaseUnit: true, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'kg', label: 'Kilogram (kg)', group: 'mass', baseValue: 1000, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'ons', label: 'Ons (100g)', group: 'mass', baseValue: 100, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'karung', label: 'Karung (50kg)', group: 'mass', baseValue: 50000, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: false },

    // Volume units (base: ml)
    { name: 'ml', label: 'Mililiter (ml)', group: 'volume', baseValue: 1, isBaseUnit: true, isPurchaseUnit: false, isUsageUnit: true },
    { name: 'liter', label: 'Liter', group: 'volume', baseValue: 1000, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'botol', label: 'Botol', group: 'volume', baseValue: 600, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: false },
    { name: 'sdm', label: 'Sendok Makan (sdm)', group: 'volume', baseValue: 15, isBaseUnit: false, isPurchaseUnit: false, isUsageUnit: true },
    { name: 'sdt', label: 'Sendok Teh (sdt)', group: 'volume', baseValue: 5, isBaseUnit: false, isPurchaseUnit: false, isUsageUnit: true },
    { name: 'gelas', label: 'Gelas (250ml)', group: 'volume', baseValue: 250, isBaseUnit: false, isPurchaseUnit: false, isUsageUnit: true },

    // Count units (base: pcs)
    { name: 'pcs', label: 'Pcs / Buah', group: 'count', baseValue: 1, isBaseUnit: true, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'butir', label: 'Butir', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'siung', label: 'Siung', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: false, isUsageUnit: true },
    { name: 'batang', label: 'Batang', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'lembar', label: 'Lembar', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'ikat', label: 'Ikat', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'bungkus', label: 'Bungkus', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'sachet', label: 'Sachet', group: 'count', baseValue: 1, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: true },
    { name: 'lusin', label: 'Lusin (12)', group: 'count', baseValue: 12, isBaseUnit: false, isPurchaseUnit: true, isUsageUnit: false },
];

class UnitMasterService {
    // Get all units for organization
    async getAll(organizationId: number) {
        return await prisma.unit.findMany({
            where: { organizationId },
            orderBy: [
                { group: 'asc' },
                { baseValue: 'desc' }
            ]
        });
    }

    // Get all units grouped by type
    async getAllGrouped(organizationId: number) {
        const units = await this.getAll(organizationId);

        const grouped = {
            mass: units.filter(u => u.group === 'mass'),
            volume: units.filter(u => u.group === 'volume'),
            count: units.filter(u => u.group === 'count')
        };

        return grouped;
    }

    // Get purchase units only
    async getPurchaseUnits(organizationId: number) {
        return await prisma.unit.findMany({
            where: { organizationId, isPurchaseUnit: true },
            orderBy: [
                { group: 'asc' },
                { baseValue: 'desc' }
            ]
        });
    }

    // Get usage units only
    async getUsageUnits(organizationId: number) {
        return await prisma.unit.findMany({
            where: { organizationId, isUsageUnit: true },
            orderBy: [
                { group: 'asc' },
                { baseValue: 'desc' }
            ]
        });
    }

    // Get compatible usage units for a purchase unit (same group)
    async getCompatibleUnits(organizationId: number, purchaseUnitName: string) {
        const purchaseUnit = await prisma.unit.findFirst({
            where: { organizationId, name: purchaseUnitName }
        });

        if (!purchaseUnit) {
            return await this.getUsageUnits(organizationId);
        }

        return await prisma.unit.findMany({
            where: {
                organizationId,
                group: purchaseUnit.group,
                isUsageUnit: true
            },
            orderBy: { baseValue: 'desc' }
        });
    }

    // Get unit by ID
    async getById(id: string, organizationId: number) {
        return await prisma.unit.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });
    }

    // Get unit by name
    async getByName(organizationId: number, name: string) {
        return await prisma.unit.findFirst({
            where: {
                organizationId,
                name: name.toLowerCase()
            }
        });
    }

    // Create new unit
    async create(data: UnitData, organizationId: number) {
        return await prisma.unit.create({
            data: {
                name: data.name.toLowerCase(),
                label: data.label,
                group: data.group,
                baseValue: data.baseValue || 1,
                isBaseUnit: data.isBaseUnit || false,
                isPurchaseUnit: data.isPurchaseUnit !== undefined ? data.isPurchaseUnit : true,
                isUsageUnit: data.isUsageUnit !== undefined ? data.isUsageUnit : true,
                description: data.description,
                organizationId
            }
        });
    }

    // Update unit
    async update(id: string, data: Partial<UnitData>, organizationId: number) {
        const unit = await prisma.unit.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!unit) {
            throw new Error('Unit tidak ditemukan');
        }

        const updateData: any = {};

        if (data.name) updateData.name = data.name.toLowerCase();
        if (data.label) updateData.label = data.label;
        if (data.group) updateData.group = data.group;
        if (data.baseValue !== undefined) updateData.baseValue = data.baseValue;
        if (data.isBaseUnit !== undefined) updateData.isBaseUnit = data.isBaseUnit;
        if (data.isPurchaseUnit !== undefined) updateData.isPurchaseUnit = data.isPurchaseUnit;
        if (data.isUsageUnit !== undefined) updateData.isUsageUnit = data.isUsageUnit;
        if (data.description !== undefined) updateData.description = data.description;

        return await prisma.unit.update({
            where: { id: parseInt(id) },
            data: updateData
        });
    }

    // Delete unit
    async delete(id: string, organizationId: number) {
        const unit = await prisma.unit.findFirst({
            where: {
                id: parseInt(id),
                organizationId
            }
        });

        if (!unit) {
            throw new Error('Unit tidak ditemukan');
        }

        return await prisma.unit.delete({
            where: { id: parseInt(id) }
        });
    }

    // Seed default units for a new organization
    async seedDefaultUnits(organizationId: number) {
        const existingUnits = await prisma.unit.count({
            where: { organizationId }
        });

        if (existingUnits > 0) {
            console.log('Units already seeded for this organization, skipping...');
            return;
        }

        console.log(`Seeding default units for organization ${organizationId}...`);

        for (const unit of DEFAULT_UNITS) {
            await prisma.unit.create({
                data: {
                    name: unit.name,
                    label: unit.label,
                    group: unit.group,
                    baseValue: unit.baseValue || 1,
                    isBaseUnit: unit.isBaseUnit || false,
                    isPurchaseUnit: unit.isPurchaseUnit !== undefined ? unit.isPurchaseUnit : true,
                    isUsageUnit: unit.isUsageUnit !== undefined ? unit.isUsageUnit : true,
                    description: unit.description,
                    organizationId
                }
            });
        }

        console.log(`Seeded ${DEFAULT_UNITS.length} default units`);
    }

    // Calculate conversion rate between two units
    async getConversionRate(organizationId: number, fromUnitName: string, toUnitName: string, packageSize: number = 1) {
        const fromUnit = await this.getByName(organizationId, fromUnitName);
        const toUnit = await this.getByName(organizationId, toUnitName);

        if (!fromUnit || !toUnit) {
            return packageSize || 1;
        }

        // If units are not in same group, return package size
        if (fromUnit.group !== toUnit.group) {
            return packageSize || 1;
        }

        // Calculate: fromUnit.baseValue / toUnit.baseValue
        return (fromUnit.baseValue / toUnit.baseValue) * packageSize;
    }
}

export default new UnitMasterService();
