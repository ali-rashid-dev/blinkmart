ALTER TABLE "product"
ADD COLUMN "variantsEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "product_variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "attributes" JSONB NOT NULL,
    "attributesKey" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "salePrice" DECIMAL(10,2),
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_variant_stockQuantity_check" CHECK ("stockQuantity" >= 0),
    CONSTRAINT "product_variant_price_check" CHECK ("price" > 0),
    CONSTRAINT "product_variant_salePrice_check" CHECK ("salePrice" IS NULL OR ("salePrice" >= 0 AND "salePrice" < "price")),
    CONSTRAINT "product_variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");
CREATE UNIQUE INDEX "product_variant_id_productId_key" ON "product_variant"("id", "productId");
CREATE UNIQUE INDEX "product_variant_productId_attributesKey_key" ON "product_variant"("productId", "attributesKey");
CREATE INDEX "product_variant_productId_isActive_idx" ON "product_variant"("productId", "isActive");

ALTER TABLE "cart_item" ADD COLUMN "variantId" TEXT;
DROP INDEX IF EXISTS "cart_item_cartId_productId_key";
CREATE UNIQUE INDEX "cart_item_cartId_productId_variantId_key" ON "cart_item"("cartId", "productId", "variantId");
CREATE UNIQUE INDEX "cart_item_one_simple_product_per_cart_key"
ON "cart_item"("cartId", "productId") WHERE "variantId" IS NULL;
ALTER TABLE "cart_item"
ADD CONSTRAINT "cart_item_variantId_productId_fkey"
FOREIGN KEY ("variantId", "productId") REFERENCES "product_variant"("id", "productId")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_item"
ADD COLUMN "variantId" TEXT,
ADD COLUMN "sku" TEXT,
ADD COLUMN "variantAttributes" JSONB;
ALTER TABLE "order_item"
ADD CONSTRAINT "order_item_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "product_variant"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "order_item_variantId_idx" ON "order_item"("variantId");
