/**
 * Unit Conversion Service
 * Handles conversion between purchase units and usage units
 */

// Standard unit definitions
export const UNIT_GROUPS = {
    // Mass units (base: gram)
    mass: {
        baseUnit: 'gram',
        units: {
            'kg': 1000,
            'gram': 1,
            'g': 1,
            'ons': 100,
            'karung': 50000,  // Default 50kg bag
        }
    },
    // Volume units (base: ml)
    volume: {
        baseUnit: 'ml',
        units: {
            'liter': 1000,
            'l': 1000,
            'ml': 1,
            'sdm': 15,      // 1 sendok makan = 15ml
            'tbsp': 15,
            'sdt': 5,       // 1 sendok teh = 5ml
            'tsp': 5,
            'gelas': 250,   // 1 gelas = 250ml
            'cup': 240,
            'botol': 600,   // Default bottle = 600ml
        }
    },
    // Count units (base: pcs)
    count: {
        baseUnit: 'pcs',
        units: {
            'pcs': 1,
            'buah': 1,
            'butir': 1,
            'siung': 1,
            'batang': 1,
            'lembar': 1,
            'ikat': 1,
            'bungkus': 1,
            'sachet': 1,
            'lusin': 12,
            'kodi': 20,
        }
    }
};

// Purchase unit options (when buying ingredients)
export const PURCHASE_UNITS = [
    // Mass
    { value: 'kg', label: 'Kilogram (kg)', group: 'mass' },
    { value: 'karung', label: 'Karung (50kg)', group: 'mass' },
    { value: 'ons', label: 'Ons (100g)', group: 'mass' },
    // Volume
    { value: 'liter', label: 'Liter', group: 'volume' },
    { value: 'botol', label: 'Botol', group: 'volume' },
    // Count
    { value: 'pcs', label: 'Pcs / Buah', group: 'count' },
    { value: 'bungkus', label: 'Bungkus', group: 'count' },
    { value: 'lusin', label: 'Lusin (12)', group: 'count' },
];

// Usage unit options (in recipes)
export const USAGE_UNITS = [
    // Mass
    { value: 'gram', label: 'Gram (g)', group: 'mass' },
    { value: 'kg', label: 'Kilogram (kg)', group: 'mass' },
    { value: 'ons', label: 'Ons (100g)', group: 'mass' },
    // Volume  
    { value: 'ml', label: 'Mililiter (ml)', group: 'volume' },
    { value: 'liter', label: 'Liter', group: 'volume' },
    { value: 'sdm', label: 'Sendok Makan (sdm)', group: 'volume' },
    { value: 'sdt', label: 'Sendok Teh (sdt)', group: 'volume' },
    { value: 'gelas', label: 'Gelas (250ml)', group: 'volume' },
    // Count
    { value: 'pcs', label: 'Pcs / Buah', group: 'count' },
    { value: 'butir', label: 'Butir', group: 'count' },
    { value: 'siung', label: 'Siung', group: 'count' },
    { value: 'batang', label: 'Batang', group: 'count' },
    { value: 'lembar', label: 'Lembar', group: 'count' },
    { value: 'bungkus', label: 'Bungkus', group: 'count' },
    { value: 'sachet', label: 'Sachet', group: 'count' },
];

// Get unit group (mass, volume, count)
export const getUnitGroup = (unit: string): string | null => {
    const unitLower = unit.toLowerCase();
    for (const [groupName, group] of Object.entries(UNIT_GROUPS)) {
        if (unitLower in group.units) {
            return groupName;
        }
    }
    return null;
};

// Check if two units are compatible (same group)
export const areUnitsCompatible = (unit1: string, unit2: string): boolean => {
    const group1 = getUnitGroup(unit1);
    const group2 = getUnitGroup(unit2);
    return group1 !== null && group1 === group2;
};

// Get default conversion rate from purchase unit to usage unit
export const getDefaultConversionRate = (
    purchaseUnit: string,
    usageUnit: string,
    packageSize: number = 1
): number => {
    const purchaseGroup = getUnitGroup(purchaseUnit);
    const usageGroup = getUnitGroup(usageUnit);

    // If units are not in same group, return package size or 1
    if (purchaseGroup !== usageGroup) {
        return packageSize || 1;
    }

    const group = UNIT_GROUPS[purchaseGroup as keyof typeof UNIT_GROUPS];
    const purchaseValue = group.units[purchaseUnit as keyof typeof group.units] || 1;
    const usageValue = group.units[usageUnit as keyof typeof group.units] || 1;

    // How many usage units in 1 purchase unit
    // e.g., 1 kg = 1000 gram, 1 liter = 1000 ml
    const baseRate = purchaseValue / usageValue;

    // Apply package size if relevant (e.g., 600ml bottle)
    if (purchaseUnit === 'botol' || purchaseUnit === 'karung') {
        return packageSize * (purchaseValue / usageValue);
    }

    return baseRate;
};

// Calculate price per usage unit
export const calculatePricePerUsageUnit = (
    purchasePrice: number,
    conversionRate: number
): number => {
    if (conversionRate <= 0) return 0;
    return purchasePrice / conversionRate;
};

// Get compatible usage units for a purchase unit
export const getCompatibleUsageUnits = (purchaseUnit: string): typeof USAGE_UNITS => {
    const group = getUnitGroup(purchaseUnit);
    if (!group) return USAGE_UNITS; // Return all if unknown

    return USAGE_UNITS.filter(u => u.group === group);
};

// Format conversion display
export const formatConversionDisplay = (
    purchaseUnit: string,
    usageUnit: string,
    conversionRate: number,
    packageSize?: number
): string => {
    if (packageSize && (purchaseUnit === 'botol' || purchaseUnit === 'karung')) {
        return `1 ${purchaseUnit} (${packageSize} ${usageUnit}) = ${conversionRate} ${usageUnit}`;
    }
    return `1 ${purchaseUnit} = ${conversionRate} ${usageUnit}`;
};

export default {
    UNIT_GROUPS,
    PURCHASE_UNITS,
    USAGE_UNITS,
    getUnitGroup,
    areUnitsCompatible,
    getDefaultConversionRate,
    calculatePricePerUsageUnit,
    getCompatibleUsageUnits,
    formatConversionDisplay,
};
