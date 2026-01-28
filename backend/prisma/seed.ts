import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clean existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.menuBundleItem.deleteMany();
    await prisma.menuBundle.deleteMany();
    await prisma.recipeComponent.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.menuRecipe.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.category.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.recipeCategory.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    // ============================================
    // 1. Create Users
    // ============================================
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('sasuke1231', 10);
    const superAdminHashedPassword = await bcrypt.hash('sasuke1231@', 10);

    // Super Admin user (for system-wide administration)
    const superAdminUser = await prisma.user.create({
        data: {
            email: 'superadmin@mail.com',
            password: superAdminHashedPassword,
            name: 'Super Admin',
            role: 'SUPERADMIN',
            isVerified: true,
            onboardingCompleted: true
        }
    });
    console.log('🔐 Super Admin created - Email: superadmin@mail.com, Password: sasuke1231@');

    const adminUser = await prisma.user.create({
        data: {
            email: 'muhamadirmansah0@gmail.com',
            password: hashedPassword,
            name: 'Admin ResepKu',
            role: 'ADMIN',
            isVerified: true
        }
    });

    const chefUser = await prisma.user.create({
        data: {
            email: 'chef@resepku.com',
            password: hashedPassword,
            name: 'Chef Budi',
            role: 'MEMBER',
            isVerified: true
        }
    });

    // ============================================
    // 2. Create Organization
    // ============================================
    console.log('🏢 Creating organization...');
    const organization = await prisma.organization.create({
        data: {
            name: 'Warung Makan Sederhana',
            slug: 'warung-sederhana',
            description: 'Warung makan dengan masakan rumahan yang lezat',
            isActive: true
        }
    });

    // Add members to organization
    await prisma.organizationMember.create({
        data: {
            userId: adminUser.id,
            organizationId: organization.id,
            role: 'OWNER',
            isDefault: true
        }
    });

    await prisma.organizationMember.create({
        data: {
            userId: chefUser.id,
            organizationId: organization.id,
            role: 'MEMBER',
            isDefault: true
        }
    });

    // ============================================
    // 3. Create Units
    // ============================================
    console.log('📏 Creating units...');
    const units = await Promise.all([
        // Weight units
        prisma.unit.create({
            data: {
                name: 'kg',
                label: 'Kilogram',
                group: 'Berat',
                baseValue: 1000,
                isBaseUnit: false,
                isPurchaseUnit: true,
                isUsageUnit: false,
                organizationId: organization.id
            }
        }),
        prisma.unit.create({
            data: {
                name: 'gram',
                label: 'Gram',
                group: 'Berat',
                baseValue: 1,
                isBaseUnit: true,
                isPurchaseUnit: false,
                isUsageUnit: true,
                organizationId: organization.id
            }
        }),
        prisma.unit.create({
            data: {
                name: 'ons',
                label: 'Ons',
                group: 'Berat',
                baseValue: 100,
                isBaseUnit: false,
                isPurchaseUnit: true,
                isUsageUnit: true,
                organizationId: organization.id
            }
        }),
        // Volume units
        prisma.unit.create({
            data: {
                name: 'liter',
                label: 'Liter',
                group: 'Volume',
                baseValue: 1000,
                isBaseUnit: false,
                isPurchaseUnit: true,
                isUsageUnit: false,
                organizationId: organization.id
            }
        }),
        prisma.unit.create({
            data: {
                name: 'ml',
                label: 'Mililiter',
                group: 'Volume',
                baseValue: 1,
                isBaseUnit: true,
                isPurchaseUnit: false,
                isUsageUnit: true,
                organizationId: organization.id
            }
        }),
        // Count units
        prisma.unit.create({
            data: {
                name: 'pcs',
                label: 'Pieces',
                group: 'Satuan',
                baseValue: 1,
                isBaseUnit: true,
                isPurchaseUnit: true,
                isUsageUnit: true,
                organizationId: organization.id
            }
        }),
        prisma.unit.create({
            data: {
                name: 'butir',
                label: 'Butir',
                group: 'Satuan',
                baseValue: 1,
                isBaseUnit: true,
                isPurchaseUnit: true,
                isUsageUnit: true,
                organizationId: organization.id
            }
        }),
        prisma.unit.create({
            data: {
                name: 'ikat',
                label: 'Ikat',
                group: 'Satuan',
                baseValue: 1,
                isBaseUnit: true,
                isPurchaseUnit: true,
                isUsageUnit: true,
                organizationId: organization.id
            }
        })
    ]);

    // ============================================
    // 4. Create Ingredient Categories
    // ============================================
    console.log('📁 Creating ingredient categories...');
    const categoryProtein = await prisma.category.create({
        data: {
            name: 'Protein',
            description: 'Daging, ikan, telur, dan sumber protein lainnya',
            organizationId: organization.id
        }
    });

    const categoryVegetable = await prisma.category.create({
        data: {
            name: 'Sayuran',
            description: 'Sayuran segar',
            organizationId: organization.id
        }
    });

    const categorySpice = await prisma.category.create({
        data: {
            name: 'Bumbu',
            description: 'Bumbu dapur dan rempah',
            organizationId: organization.id
        }
    });

    const categoryCarb = await prisma.category.create({
        data: {
            name: 'Karbohidrat',
            description: 'Beras, mie, tepung',
            organizationId: organization.id
        }
    });

    const categoryOil = await prisma.category.create({
        data: {
            name: 'Minyak & Lemak',
            description: 'Minyak goreng dan mentega',
            organizationId: organization.id
        }
    });

    // ============================================
    // 5. Create Ingredients
    // ============================================
    console.log('🥬 Creating ingredients...');

    // Protein
    const ayam = await prisma.ingredient.create({
        data: {
            name: 'Ayam Potong',
            purchaseUnit: 'kg',
            purchasePrice: 35000,
            packageSize: 1,
            yieldPercentage: 85,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 41.18,
            categoryId: categoryProtein.id,
            organizationId: organization.id
        }
    });

    const telur = await prisma.ingredient.create({
        data: {
            name: 'Telur Ayam',
            purchaseUnit: 'butir',
            purchasePrice: 2500,
            packageSize: 1,
            yieldPercentage: 100,
            usageUnit: 'butir',
            conversionRate: 1,
            unit: 'butir',
            pricePerUnit: 2500,
            categoryId: categoryProtein.id,
            organizationId: organization.id
        }
    });

    const ikanNila = await prisma.ingredient.create({
        data: {
            name: 'Ikan Nila',
            purchaseUnit: 'kg',
            purchasePrice: 32000,
            packageSize: 1,
            yieldPercentage: 70,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 45.71,
            categoryId: categoryProtein.id,
            organizationId: organization.id
        }
    });

    const tempe = await prisma.ingredient.create({
        data: {
            name: 'Tempe',
            purchaseUnit: 'pcs',
            purchasePrice: 5000,
            packageSize: 1,
            yieldPercentage: 100,
            usageUnit: 'gram',
            conversionRate: 200,
            unit: 'gram',
            pricePerUnit: 25,
            categoryId: categoryProtein.id,
            organizationId: organization.id
        }
    });

    // Vegetables
    const kangkung = await prisma.ingredient.create({
        data: {
            name: 'Kangkung',
            purchaseUnit: 'ikat',
            purchasePrice: 3000,
            packageSize: 1,
            yieldPercentage: 80,
            usageUnit: 'gram',
            conversionRate: 200,
            unit: 'gram',
            pricePerUnit: 18.75,
            categoryId: categoryVegetable.id,
            organizationId: organization.id
        }
    });

    const bayam = await prisma.ingredient.create({
        data: {
            name: 'Bayam',
            purchaseUnit: 'ikat',
            purchasePrice: 2500,
            packageSize: 1,
            yieldPercentage: 85,
            usageUnit: 'gram',
            conversionRate: 150,
            unit: 'gram',
            pricePerUnit: 19.61,
            categoryId: categoryVegetable.id,
            organizationId: organization.id
        }
    });

    const wortel = await prisma.ingredient.create({
        data: {
            name: 'Wortel',
            purchaseUnit: 'kg',
            purchasePrice: 15000,
            packageSize: 1,
            yieldPercentage: 90,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 16.67,
            categoryId: categoryVegetable.id,
            organizationId: organization.id
        }
    });

    const kentang = await prisma.ingredient.create({
        data: {
            name: 'Kentang',
            purchaseUnit: 'kg',
            purchasePrice: 18000,
            packageSize: 1,
            yieldPercentage: 85,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 21.18,
            categoryId: categoryVegetable.id,
            organizationId: organization.id
        }
    });

    // Spices
    const bawangMerah = await prisma.ingredient.create({
        data: {
            name: 'Bawang Merah',
            purchaseUnit: 'kg',
            purchasePrice: 35000,
            packageSize: 1,
            yieldPercentage: 95,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 36.84,
            categoryId: categorySpice.id,
            organizationId: organization.id
        }
    });

    const bawangPutih = await prisma.ingredient.create({
        data: {
            name: 'Bawang Putih',
            purchaseUnit: 'kg',
            purchasePrice: 40000,
            packageSize: 1,
            yieldPercentage: 95,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 42.11,
            categoryId: categorySpice.id,
            organizationId: organization.id
        }
    });

    const cabaiMerah = await prisma.ingredient.create({
        data: {
            name: 'Cabai Merah',
            purchaseUnit: 'kg',
            purchasePrice: 45000,
            packageSize: 1,
            yieldPercentage: 95,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 47.37,
            categoryId: categorySpice.id,
            organizationId: organization.id
        }
    });

    const garam = await prisma.ingredient.create({
        data: {
            name: 'Garam',
            purchaseUnit: 'kg',
            purchasePrice: 12000,
            packageSize: 1,
            yieldPercentage: 100,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 12,
            categoryId: categorySpice.id,
            organizationId: organization.id
        }
    });

    const gula = await prisma.ingredient.create({
        data: {
            name: 'Gula Pasir',
            purchaseUnit: 'kg',
            purchasePrice: 15000,
            packageSize: 1,
            yieldPercentage: 100,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 15,
            categoryId: categorySpice.id,
            organizationId: organization.id
        }
    });

    // Carbs
    const beras = await prisma.ingredient.create({
        data: {
            name: 'Beras',
            purchaseUnit: 'kg',
            purchasePrice: 14000,
            packageSize: 1,
            yieldPercentage: 100,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 14,
            categoryId: categoryCarb.id,
            organizationId: organization.id
        }
    });

    const tepungTerigu = await prisma.ingredient.create({
        data: {
            name: 'Tepung Terigu',
            purchaseUnit: 'kg',
            purchasePrice: 12000,
            packageSize: 1,
            yieldPercentage: 100,
            usageUnit: 'gram',
            conversionRate: 1000,
            unit: 'gram',
            pricePerUnit: 12,
            categoryId: categoryCarb.id,
            organizationId: organization.id
        }
    });

    // Oil
    const minyakGoreng = await prisma.ingredient.create({
        data: {
            name: 'Minyak Goreng',
            purchaseUnit: 'liter',
            purchasePrice: 18000,
            packageSize: 1,
            yieldPercentage: 100,
            usageUnit: 'ml',
            conversionRate: 1000,
            unit: 'ml',
            pricePerUnit: 18,
            categoryId: categoryOil.id,
            organizationId: organization.id
        }
    });

    // ============================================
    // 6. Create Recipe Categories
    // ============================================
    console.log('📂 Creating recipe categories...');
    const recipeCatMakanan = await prisma.recipeCategory.create({
        data: {
            name: 'Makanan Utama',
            description: 'Menu makanan utama',
            organizationId: organization.id
        }
    });

    const recipeCatSayur = await prisma.recipeCategory.create({
        data: {
            name: 'Sayur & Lalapan',
            description: 'Menu sayuran',
            organizationId: organization.id
        }
    });

    const recipeCatGorengan = await prisma.recipeCategory.create({
        data: {
            name: 'Gorengan',
            description: 'Menu gorengan',
            organizationId: organization.id
        }
    });

    const recipeCatSambal = await prisma.recipeCategory.create({
        data: {
            name: 'Sambal',
            description: 'Berbagai jenis sambal',
            organizationId: organization.id
        }
    });

    // ============================================
    // 7. Create Recipes
    // ============================================
    console.log('🍳 Creating recipes...');

    // Sambal Terasi (Base Recipe)
    const sambalTerasi = await prisma.recipe.create({
        data: {
            name: 'Sambal Terasi',
            description: 'Sambal terasi pedas khas Jawa',
            servings: 10,
            sop: '1. Goreng cabai, bawang merah, bawang putih\n2. Ulek semua bahan\n3. Tambahkan terasi, garam, gula\n4. Ulek hingga halus',
            categoryId: recipeCatSambal.id,
            organizationId: organization.id,
            RecipeIngredient: {
                create: [
                    { ingredientId: cabaiMerah.id, quantity: 100 },
                    { ingredientId: bawangMerah.id, quantity: 50 },
                    { ingredientId: bawangPutih.id, quantity: 20 },
                    { ingredientId: garam.id, quantity: 5 },
                    { ingredientId: gula.id, quantity: 10 },
                    { ingredientId: minyakGoreng.id, quantity: 30 }
                ]
            }
        }
    });

    // Ayam Goreng
    const ayamGoreng = await prisma.recipe.create({
        data: {
            name: 'Ayam Goreng Kremes',
            description: 'Ayam goreng renyah dengan kremes gurih',
            servings: 4,
            videoUrl: 'https://www.youtube.com/watch?v=example1',
            sop: '1. Marinasi ayam dengan bumbu\n2. Goreng ayam hingga matang\n3. Buat kremes dari tepung\n4. Sajikan ayam dengan kremes',
            categoryId: recipeCatMakanan.id,
            organizationId: organization.id,
            RecipeIngredient: {
                create: [
                    { ingredientId: ayam.id, quantity: 500 },
                    { ingredientId: bawangPutih.id, quantity: 30 },
                    { ingredientId: garam.id, quantity: 10 },
                    { ingredientId: tepungTerigu.id, quantity: 100 },
                    { ingredientId: minyakGoreng.id, quantity: 200 }
                ]
            }
        }
    });

    // Kangkung Tumis
    const kangkungTumis = await prisma.recipe.create({
        data: {
            name: 'Tumis Kangkung',
            description: 'Kangkung tumis dengan bawang putih',
            servings: 3,
            sop: '1. Tumis bawang putih hingga harum\n2. Masukkan kangkung\n3. Tambahkan garam dan sedikit air\n4. Masak hingga layu',
            categoryId: recipeCatSayur.id,
            organizationId: organization.id,
            RecipeIngredient: {
                create: [
                    { ingredientId: kangkung.id, quantity: 200 },
                    { ingredientId: bawangPutih.id, quantity: 15 },
                    { ingredientId: bawangMerah.id, quantity: 20 },
                    { ingredientId: cabaiMerah.id, quantity: 10 },
                    { ingredientId: garam.id, quantity: 3 },
                    { ingredientId: minyakGoreng.id, quantity: 30 }
                ]
            }
        }
    });

    // Tempe Goreng
    const tempeGoreng = await prisma.recipe.create({
        data: {
            name: 'Tempe Goreng Tepung',
            description: 'Tempe goreng crispy dengan balutan tepung',
            servings: 4,
            sop: '1. Iris tempe tipis\n2. Celupkan ke adonan tepung\n3. Goreng hingga kecokelatan',
            categoryId: recipeCatGorengan.id,
            organizationId: organization.id,
            RecipeIngredient: {
                create: [
                    { ingredientId: tempe.id, quantity: 200 },
                    { ingredientId: tepungTerigu.id, quantity: 50 },
                    { ingredientId: bawangPutih.id, quantity: 10 },
                    { ingredientId: garam.id, quantity: 3 },
                    { ingredientId: minyakGoreng.id, quantity: 100 }
                ]
            }
        }
    });

    // Nasi Putih
    const nasiPutih = await prisma.recipe.create({
        data: {
            name: 'Nasi Putih',
            description: 'Nasi putih pulen',
            servings: 4,
            sop: '1. Cuci beras hingga bersih\n2. Masak dengan rice cooker\n3. Diamkan 10 menit sebelum disajikan',
            categoryId: recipeCatMakanan.id,
            organizationId: organization.id,
            RecipeIngredient: {
                create: [
                    { ingredientId: beras.id, quantity: 400 }
                ]
            }
        }
    });

    // Telur Dadar
    const telurDadar = await prisma.recipe.create({
        data: {
            name: 'Telur Dadar',
            description: 'Telur dadar dengan bawang',
            servings: 2,
            sop: '1. Kocok telur dengan bawang\n2. Tambahkan garam\n3. Goreng hingga matang kedua sisi',
            categoryId: recipeCatMakanan.id,
            organizationId: organization.id,
            RecipeIngredient: {
                create: [
                    { ingredientId: telur.id, quantity: 3 },
                    { ingredientId: bawangMerah.id, quantity: 20 },
                    { ingredientId: garam.id, quantity: 2 },
                    { ingredientId: minyakGoreng.id, quantity: 30 }
                ]
            }
        }
    });

    // ============================================
    // 8. Create Menu Categories
    // ============================================
    console.log('📋 Creating menu categories...');
    const menuCatPaket = await prisma.menuCategory.create({
        data: {
            name: 'Paket Hemat',
            description: 'Menu paket dengan harga terjangkau',
            organizationId: organization.id
        }
    });

    const menuCatSatuan = await prisma.menuCategory.create({
        data: {
            name: 'Menu Satuan',
            description: 'Menu per item',
            organizationId: organization.id
        }
    });

    const menuCatTambahan = await prisma.menuCategory.create({
        data: {
            name: 'Tambahan',
            description: 'Menu tambahan',
            organizationId: organization.id
        }
    });

    // ============================================
    // 9. Create Menus
    // ============================================
    console.log('🍽️ Creating menus...');

    // Paket Ayam Geprek
    await prisma.menu.create({
        data: {
            name: 'Paket Ayam Goreng Komplit',
            description: 'Ayam goreng + nasi + sayur + sambal',
            sellingPrice: 20000,
            isActive: true,
            categoryId: menuCatPaket.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: ayamGoreng.id, quantity: 1 },
                    { recipeId: nasiPutih.id, quantity: 1 },
                    { recipeId: kangkungTumis.id, quantity: 1 },
                    { recipeId: sambalTerasi.id, quantity: 1 }
                ]
            }
        }
    });

    // Paket Tempe
    await prisma.menu.create({
        data: {
            name: 'Paket Tempe Hemat',
            description: 'Tempe goreng + nasi + sayur',
            sellingPrice: 12000,
            isActive: true,
            categoryId: menuCatPaket.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: tempeGoreng.id, quantity: 1 },
                    { recipeId: nasiPutih.id, quantity: 1 },
                    { recipeId: kangkungTumis.id, quantity: 1 }
                ]
            }
        }
    });

    // Menu Satuan
    await prisma.menu.create({
        data: {
            name: 'Ayam Goreng Kremes',
            description: 'Ayam goreng 1 potong',
            sellingPrice: 12000,
            isActive: true,
            categoryId: menuCatSatuan.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: ayamGoreng.id, quantity: 1 }
                ]
            }
        }
    });

    await prisma.menu.create({
        data: {
            name: 'Tempe Goreng',
            description: 'Tempe goreng 5 potong',
            sellingPrice: 5000,
            isActive: true,
            categoryId: menuCatSatuan.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: tempeGoreng.id, quantity: 1 }
                ]
            }
        }
    });

    await prisma.menu.create({
        data: {
            name: 'Tumis Kangkung',
            description: 'Sayur tumis kangkung',
            sellingPrice: 6000,
            isActive: true,
            categoryId: menuCatSatuan.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: kangkungTumis.id, quantity: 1 }
                ]
            }
        }
    });

    // Tambahan
    await prisma.menu.create({
        data: {
            name: 'Nasi Putih',
            description: 'Nasi putih 1 porsi',
            sellingPrice: 5000,
            isActive: true,
            categoryId: menuCatTambahan.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: nasiPutih.id, quantity: 1 }
                ]
            }
        }
    });

    await prisma.menu.create({
        data: {
            name: 'Telur Dadar',
            description: 'Telur dadar 1 porsi',
            sellingPrice: 5000,
            isActive: true,
            categoryId: menuCatTambahan.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: telurDadar.id, quantity: 1 }
                ]
            }
        }
    });

    await prisma.menu.create({
        data: {
            name: 'Sambal Terasi',
            description: 'Sambal terasi extra',
            sellingPrice: 2000,
            isActive: true,
            categoryId: menuCatTambahan.id,
            organizationId: organization.id,
            MenuRecipe: {
                create: [
                    { recipeId: sambalTerasi.id, quantity: 1 }
                ]
            }
        }
    });

    // ============================================
    // 10. Create Menu Bundles (Promo Packages)
    // ============================================
    console.log('🎁 Creating menu bundles...');

    // Get menus for bundling
    const allMenus = await prisma.menu.findMany({
        where: { organizationId: organization.id }
    });

    const menuAyamGoreng = allMenus.find(m => m.name === 'Ayam Goreng Kremes');
    const menuTempeGoreng = allMenus.find(m => m.name === 'Tempe Goreng');
    const menuTumisKangkung = allMenus.find(m => m.name === 'Tumis Kangkung');
    const menuNasiPutih = allMenus.find(m => m.name === 'Nasi Putih');
    const menuTelurDadar = allMenus.find(m => m.name === 'Telur Dadar');
    const menuSambal = allMenus.find(m => m.name === 'Sambal Terasi');

    // Bundle 1: Buy 1 Get 1 Ayam Goreng
    if (menuAyamGoreng && menuNasiPutih) {
        await prisma.menuBundle.create({
            data: {
                name: 'Promo BOGO Ayam Goreng',
                description: 'Beli 1 Ayam Goreng GRATIS 1 Nasi Putih!',
                promotionType: 'BUY1GET1',
                isActive: true,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                organizationId: organization.id,
                items: {
                    create: [
                        { menuId: menuAyamGoreng.id, quantity: 1, isFree: false },
                        { menuId: menuNasiPutih.id, quantity: 1, isFree: true }
                    ]
                }
            }
        });
    }

    // Bundle 2: Diskon 20% Paket Makan Siang
    if (menuAyamGoreng && menuNasiPutih && menuTumisKangkung && menuSambal) {
        await prisma.menuBundle.create({
            data: {
                name: 'Paket Makan Siang Hemat',
                description: 'Ayam + Nasi + Sayur + Sambal dengan diskon 20%',
                promotionType: 'PERCENTAGE',
                discountValue: 20,
                isActive: true,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
                organizationId: organization.id,
                items: {
                    create: [
                        { menuId: menuAyamGoreng.id, quantity: 1, isFree: false },
                        { menuId: menuNasiPutih.id, quantity: 1, isFree: false },
                        { menuId: menuTumisKangkung.id, quantity: 1, isFree: false },
                        { menuId: menuSambal.id, quantity: 1, isFree: false }
                    ]
                }
            }
        });
    }

    // Bundle 3: Harga Tetap Paket Keluarga
    if (menuAyamGoreng && menuNasiPutih && menuTempeGoreng && menuTumisKangkung) {
        await prisma.menuBundle.create({
            data: {
                name: 'Paket Keluarga',
                description: '2 Ayam + 4 Nasi + 2 Tempe + 2 Sayur hanya Rp 50.000',
                promotionType: 'FIXED_PRICE',
                bundlePrice: 50000,
                isActive: true,
                organizationId: organization.id,
                items: {
                    create: [
                        { menuId: menuAyamGoreng.id, quantity: 2, isFree: false },
                        { menuId: menuNasiPutih.id, quantity: 4, isFree: false },
                        { menuId: menuTempeGoreng.id, quantity: 2, isFree: false },
                        { menuId: menuTumisKangkung.id, quantity: 2, isFree: false }
                    ]
                }
            }
        });
    }

    // Bundle 4: Diskon Nominal Rp 5000
    if (menuTempeGoreng && menuTelurDadar && menuNasiPutih) {
        await prisma.menuBundle.create({
            data: {
                name: 'Paket Vegetarian',
                description: 'Tempe + Telur + Nasi - Hemat Rp 5.000',
                promotionType: 'DISCOUNT',
                discountValue: 5000,
                isActive: true,
                organizationId: organization.id,
                items: {
                    create: [
                        { menuId: menuTempeGoreng.id, quantity: 1, isFree: false },
                        { menuId: menuTelurDadar.id, quantity: 1, isFree: false },
                        { menuId: menuNasiPutih.id, quantity: 1, isFree: false }
                    ]
                }
            }
        });
    }

    // Bundle 5: Buy 2 Get 1 (Expired Bundle)
    if (menuTempeGoreng && menuTelurDadar) {
        await prisma.menuBundle.create({
            data: {
                name: 'Promo Beli 2 Gratis 1',
                description: 'Beli 2 Tempe Goreng gratis 1 Telur Dadar!',
                promotionType: 'BUY2GET1',
                isActive: true,
                validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                validUntil: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago (expired)
                organizationId: organization.id,
                items: {
                    create: [
                        { menuId: menuTempeGoreng.id, quantity: 2, isFree: false },
                        { menuId: menuTelurDadar.id, quantity: 1, isFree: true }
                    ]
                }
            }
        });
    }

    // ============================================
    // 11. Create Price History
    // ============================================
    console.log('📊 Creating price history...');
    const now = new Date();

    // Create price history for ayam
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        await prisma.priceHistory.create({
            data: {
                ingredientId: ayam.id,
                purchasePrice: 33000 + (Math.random() * 4000),
                purchaseUnit: 'kg',
                supplier: i % 2 === 0 ? 'Supplier Ayam Jaya' : 'Pasar Tradisional',
                notes: `Update harga bulan ${date.toLocaleDateString('id-ID', { month: 'long' })}`,
                recordedAt: date
            }
        });
    }

    // Create price history for cabai
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        await prisma.priceHistory.create({
            data: {
                ingredientId: cabaiMerah.id,
                purchasePrice: 30000 + (Math.random() * 30000), // Cabai price fluctuates a lot
                purchaseUnit: 'kg',
                supplier: 'Pasar Induk',
                notes: `Harga cabai ${date.toLocaleDateString('id-ID', { month: 'long' })}`,
                recordedAt: date
            }
        });
    }

    console.log('✅ Seed completed successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('   Email: muhamadirmansah0@gmail.com');
    console.log('   Password: sasuke1231');
    console.log('');
    console.log('   Email: chef@resepku.com');
    console.log('   Password: sasuke1231');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
