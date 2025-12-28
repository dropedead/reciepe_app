-- CreateTable
CREATE TABLE "MenuBundle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "promotionType" TEXT NOT NULL DEFAULT 'DISCOUNT',
    "discountValue" DOUBLE PRECISION,
    "bundlePrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuBundleItem" (
    "id" SERIAL NOT NULL,
    "bundleId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isFree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MenuBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuBundle_organizationId_idx" ON "MenuBundle"("organizationId");

-- CreateIndex
CREATE INDEX "MenuBundle_isActive_idx" ON "MenuBundle"("isActive");

-- CreateIndex
CREATE INDEX "MenuBundleItem_bundleId_idx" ON "MenuBundleItem"("bundleId");

-- CreateIndex
CREATE INDEX "MenuBundleItem_menuId_idx" ON "MenuBundleItem"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuBundleItem_bundleId_menuId_key" ON "MenuBundleItem"("bundleId", "menuId");

-- AddForeignKey
ALTER TABLE "MenuBundle" ADD CONSTRAINT "MenuBundle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuBundleItem" ADD CONSTRAINT "MenuBundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "MenuBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuBundleItem" ADD CONSTRAINT "MenuBundleItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
