import "dotenv/config";
import assert from "node:assert/strict";
import test from "node:test";
import {
  createBrand,
  updateBrand,
  toggleBrandStatus,
  deleteBrand,
  getBrands,
  getEnabledBrands,
  BrandHasProductsError,
} from "./brand.service";
import {
  listCustomerProducts,
  findCustomerProductById,
  listAdminProducts,
  createProduct,
} from "@/repositories/product.repository";
import prisma from "@/lib/prisma";

test("Brand CRUD and Business Rule Integration Test", async (t) => {
  let testBrandId: string | null = null;
  let testProductId: string | null = null;

  t.after(async () => {
    // Cleanup test data
    if (testProductId) {
      await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});
    }
    if (testBrandId) {
      await prisma.brand.delete({ where: { id: testBrandId } }).catch(() => {});
    }
  });

  await t.test("1. Create Brand A", async () => {
    const uniqueName = `Test Brand A ${Date.now()}`;
    const brand = await createBrand({
      name: uniqueName,
      origin: "Test City, Test Country",
      enabled: true,
    });

    assert.ok(brand.id, "Brand should have an ID");
    assert.equal(brand.enabled, true, "Brand should be enabled by default");
    testBrandId = brand.id;
  });

  await t.test("2. Create Product A linked to Brand A", async () => {
    assert.ok(testBrandId, "Test brand ID must exist");
    const uniqueSlug = `test-product-a-${Date.now()}`;
    const product = await createProduct({
      name: "Test Product A",
      slug: uniqueSlug,
      price: 19.99,
      brandId: testBrandId,
      enabled: true,
    });

    assert.ok(product.id, "Product should have an ID");
    assert.equal(product.brandId, testBrandId, "Product should be linked to test brand");
    testProductId = product.id;
  });

  await t.test("3. Customer sees Product A when Brand A is enabled", async () => {
    assert.ok(testProductId, "Product ID must exist");

    const customerProducts = await listCustomerProducts();
    const foundInList = customerProducts.some((p) => p.id === testProductId);
    assert.equal(foundInList, true, "Product A should be visible to customer when Brand A is enabled");

    const productDetail = await findCustomerProductById(testProductId);
    assert.ok(productDetail, "Product A detail should be accessible to customer");
  });

  await t.test("4. Safe deletion blocks deleting brand with products", async () => {
    assert.ok(testBrandId, "Brand ID must exist");
    await assert.rejects(
      async () => {
        await deleteBrand(testBrandId!);
      },
      (err: unknown) => err instanceof BrandHasProductsError,
      "Deleting a brand with products should throw BrandHasProductsError"
    );
  });

  await t.test("5. Admin disables Brand A -> Product A hidden from customer but exists in DB", async () => {
    assert.ok(testBrandId, "Brand ID must exist");
    assert.ok(testProductId, "Product ID must exist");

    // Disable brand
    const updatedBrand = await toggleBrandStatus(testBrandId, false);
    assert.equal(updatedBrand.enabled, false, "Brand enabled status should be false");

    // Verify Product record still exists unchanged in DB
    const adminProduct = await listAdminProducts();
    const foundInAdmin = adminProduct.some((p) => p.id === testProductId);
    assert.equal(foundInAdmin, true, "Product A record must still exist for admin");

    // Verify Customer product query EXCLUDES Product A
    const customerProducts = await listCustomerProducts();
    const foundInCustomer = customerProducts.some((p) => p.id === testProductId);
    assert.equal(foundInCustomer, false, "Product A must NOT be returned in customer product query");

    // Verify Direct Customer Product Detail returns null
    const customerProductDetail = await findCustomerProductById(testProductId);
    assert.equal(customerProductDetail, null, "Customer product detail must return null when brand is disabled");

    // Verify Customer Brands list EXCLUDES Brand A
    const customerBrands = await getEnabledBrands();
    const foundBrandInCustomer = customerBrands.some((b) => b.id === testBrandId);
    assert.equal(foundBrandInCustomer, false, "Brand A must NOT appear in customer enabled brands list");
  });

  await t.test("6. Admin re-enables Brand A -> Product A becomes visible to customer again", async () => {
    assert.ok(testBrandId, "Brand ID must exist");
    assert.ok(testProductId, "Product ID must exist");

    // Re-enable brand
    const updatedBrand = await toggleBrandStatus(testBrandId, true);
    assert.equal(updatedBrand.enabled, true, "Brand enabled status should be true");

    // Verify Customer product query RETURNS Product A again
    const customerProducts = await listCustomerProducts();
    const foundInCustomer = customerProducts.some((p) => p.id === testProductId);
    assert.equal(foundInCustomer, true, "Product A must be visible to customer again when Brand A is re-enabled");

    const customerProductDetail = await findCustomerProductById(testProductId);
    assert.ok(customerProductDetail, "Product A detail must be accessible again");

    // Verify Customer Brands list INCLUDES Brand A again
    const customerBrands = await getEnabledBrands();
    const foundBrandInCustomer = customerBrands.some((b) => b.id === testBrandId);
    assert.equal(foundBrandInCustomer, true, "Brand A must appear in customer enabled brands list");
  });

  await t.test("7. Delete product then delete brand", async () => {
    assert.ok(testProductId, "Product ID must exist");
    assert.ok(testBrandId, "Brand ID must exist");

    // Delete product first
    await prisma.product.delete({ where: { id: testProductId } });
    testProductId = null;

    // Now brand deletion should succeed
    const deletedBrand = await deleteBrand(testBrandId);
    assert.equal(deletedBrand.id, testBrandId, "Brand should be deleted");
    testBrandId = null;
  });
});
