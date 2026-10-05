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