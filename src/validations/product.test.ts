import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createProductSchema, updateProductSchema } from "./product";

describe("product sale price validation", () => {
  it("accepts decimal values and empty input when creating products", () => {
    const base = { name: "Item", price: 120 };
    const valid = createProductSchema.safeParse({ ...base, salePrice: "99.50" });
    const empty = createProductSchema.safeParse({ ...base, salePrice: "" });
    const whitespace = createProductSchema.safeParse({ ...base, salePrice: "  \t " });

    assert.equal(valid.success, true);
    if (valid.success) assert.equal(valid.data.salePrice, 99.5);
    assert.equal(empty.success, true);
    if (empty.success) assert.equal(empty.data.salePrice, null);
    assert.equal(whitespace.success, true);
    if (whitespace.success) assert.equal(whitespace.data.salePrice, null);
    assert.equal(createProductSchema.safeParse({ ...base, salePrice: "not-a-price" }).success, false);
    assert.equal(createProductSchema.safeParse({ ...base, salePrice: "0x10" }).success, false);
  });

  describe("product variant validation", () => {
    const base = {
      name: "Cooking Oil",
      price: 100,
      variantsEnabled: true,
      variants: [
        {
          sku: "oil-1l",
          attributes: { volume: "1 L" },
          price: 100,
          salePrice: null,
          stockQuantity: 12,
          isActive: true,
        },
        {
          sku: "oil-3l",
          attributes: { volume: "3 L", packaging: "Bottle" },
          price: 275,
          salePrice: 250,
          stockQuantity: 4,
          isActive: true,
        },
      ],
    };

    it("accepts different optional attribute combinations and normalizes SKUs", () => {
      const result = createProductSchema.safeParse(base);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.variants[0]?.sku, "OIL-1L");
        assert.equal(result.data.variants[1]?.salePrice, 250);
      }
    });

    it("rejects duplicate SKUs and duplicate attribute combinations", () => {
      const duplicateSku = structuredClone(base);
      duplicateSku.variants[1]!.sku = "OIL-1L";
      assert.equal(createProductSchema.safeParse(duplicateSku).success, false);

      const duplicateAttributes = structuredClone(base);
      duplicateAttributes.variants[1]!.attributes = { volume: "1 l" };
      assert.equal(createProductSchema.safeParse(duplicateAttributes).success, false);
    });

    it("rejects invalid stock, sale price, and products without an active variant", () => {
      const invalidStock = structuredClone(base);
      invalidStock.variants[0]!.stockQuantity = -1;
      assert.equal(createProductSchema.safeParse(invalidStock).success, false);

      const invalidSale = structuredClone(base);
      invalidSale.variants[1]!.salePrice = 300;
      assert.equal(createProductSchema.safeParse(invalidSale).success, false);

      const noActive = structuredClone(base);
      noActive.variants.forEach((variant) => { variant.isActive = false; });
      assert.equal(createProductSchema.safeParse(noActive).success, false);
    });
  });

  it("accepts decimal values and empty input when updating products", () => {
    const base = { id: "item-1" };
    const valid = updateProductSchema.safeParse({ ...base, salePrice: "99.50" });
    const empty = updateProductSchema.safeParse({ ...base, salePrice: "" });
    const whitespace = updateProductSchema.safeParse({ ...base, salePrice: "  \t " });

    assert.equal(valid.success, true);
    if (valid.success) assert.equal(valid.data.salePrice, 99.5);
    assert.equal(empty.success, true);
    if (empty.success) assert.equal(empty.data.salePrice, null);
    assert.equal(whitespace.success, true);
    if (whitespace.success) assert.equal(whitespace.data.salePrice, null);
    assert.equal(updateProductSchema.safeParse({ ...base, salePrice: "not-a-price" }).success, false);
    assert.equal(updateProductSchema.safeParse({ ...base, salePrice: "0x10" }).success, false);
  });
});