import "dotenv/config";
import assert from "node:assert/strict";
import test from "node:test";
import {
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  getCartDetails,
  clearUserCart,
  calculateCartTotals,
  ProductDisabledError,
  ProductNotFoundError,
  type CartLineItem,
} from "./cart.service";
import { createProduct, deleteProduct } from "@/repositories/product.repository";
import prisma from "@/lib/prisma";

test("Cart Service Unit & Integration Tests", async (t) => {
  let testProductId: string | null = null;
  let testDisabledProductId: string | null = null;
  const testSessionToken = `test-cart-session-${Date.now()}`;

  t.after(async () => {
    // Cleanup test data
    if (testProductId) {
      await deleteProduct(testProductId).catch(() => {});
    }
    if (testDisabledProductId) {
      await deleteProduct(testDisabledProductId).catch(() => {});
    }
    const cart = await prisma.cart.findFirst({
      where: { sessionToken: testSessionToken },
    });
    if (cart) {
      await prisma.cart.delete({ where: { id: cart.id } }).catch(() => {});
    }
  });

  await t.test("1. Create Test Products", async () => {
    const activeProd = await createProduct({
      name: "Test Fresh Organic Apple",
      slug: `test-apple-${Date.now()}`,
      price: 4.99,
      enabled: true,
    });
    testProductId = activeProd.id;
    assert.ok(testProductId, "Active product should be created");

    const disabledProd = await createProduct({
      name: "Test Out of Stock Berry",
      slug: `test-berry-${Date.now()}`,
      price: 8.5,
      enabled: false,
    });
    testDisabledProductId = disabledProd.id;
    assert.ok(testDisabledProductId, "Disabled product should be created");
  });

  await t.test("2. Add item to cart", async () => {
    assert.ok(testProductId);

    const details = await addItemToCart(
      { sessionToken: testSessionToken },
      { productId: testProductId, quantity: 2 }
    );

    assert.equal(details.lines.length, 1);
    assert.equal(details.lines[0].productId, testProductId);
    assert.equal(details.lines[0].quantity, 2);
    assert.equal(details.totals.itemCount, 2);
    assert.equal(details.totals.subtotal, 9.98);
    assert.equal(details.totals.total, 9.98);
  });

  await t.test("3. Add same item to cart again (increments quantity)", async () => {
    assert.ok(testProductId);

    const details = await addItemToCart(
      { sessionToken: testSessionToken },
      { productId: testProductId, quantity: 3 }
    );

    assert.equal(details.lines.length, 1);
    assert.equal(details.lines[0].quantity, 5);
    assert.equal(details.totals.itemCount, 5);
    assert.equal(details.totals.subtotal, 24.95);
  });

  await t.test("4. Update quantity directly", async () => {
    assert.ok(testProductId);

    const details = await updateItemQuantity(
      { sessionToken: testSessionToken },
      { productId: testProductId, quantity: 3 }
    );

    assert.equal(details.lines.length, 1);
    assert.equal(details.lines[0].quantity, 3);
    assert.equal(details.totals.itemCount, 3);
    assert.equal(details.totals.subtotal, 14.97);
  });

  await t.test("5. Update quantity to 0 removes item from cart", async () => {
    assert.ok(testProductId);

    const details = await updateItemQuantity(
      { sessionToken: testSessionToken },
      { productId: testProductId, quantity: 0 }
    );

    assert.equal(details.lines.length, 0);
    assert.equal(details.totals.itemCount, 0);
    assert.equal(details.totals.subtotal, 0);
  });

  await t.test("6. Add item back and remove explicitly", async () => {
    assert.ok(testProductId);

    await addItemToCart(
      { sessionToken: testSessionToken },
      { productId: testProductId, quantity: 1 }
    );

    const details = await removeItemFromCart(
      { sessionToken: testSessionToken },
      testProductId
    );

    assert.equal(details.lines.length, 0);
    assert.equal(details.totals.itemCount, 0);
  });

  await t.test("7. Clear user cart", async () => {
    assert.ok(testProductId);

    await addItemToCart(
      { sessionToken: testSessionToken },
      { productId: testProductId, quantity: 4 }
    );

    const details = await clearUserCart({ sessionToken: testSessionToken });

    assert.equal(details.lines.length, 0);
    assert.equal(details.totals.itemCount, 0);
  });

  await t.test("8. Cannot add disabled/unavailable product to cart", async () => {
    assert.ok(testDisabledProductId);

    await assert.rejects(
      async () => {
        await addItemToCart(
          { sessionToken: testSessionToken },
          { productId: testDisabledProductId!, quantity: 1 }
        );
      },
      // Disabled products are filtered by the customer visibility query, so they
      // appear as "not found" to customers — accept either error.
      (err: unknown) =>
        err instanceof ProductDisabledError || err instanceof ProductNotFoundError
    );
  });

  await t.test("9. Cannot add non-existent product to cart", async () => {
    await assert.rejects(
      async () => {
        await addItemToCart(
          { sessionToken: testSessionToken },
          { productId: "non-existent-id-99999", quantity: 1 }
        );
      },
      (err: unknown) => err instanceof ProductNotFoundError
    );
  });

  await t.test("10. Pure calculateCartTotals calculation test", async () => {
    const mockLines: CartLineItem[] = [
      {
        id: "1",
        productId: "p1",
        name: "Item 1",
        slug: "item-1",
        price: 10.5,
        quantity: 2,
        unit: "1 pack",
        image: "",
        maxQuantity: 99,
        total: 21,
        enabled: true,
      },
      {
        id: "2",
        productId: "p2",
        name: "Item 2",
        slug: "item-2",
        price: 3.33,
        quantity: 3,
        unit: "1 pack",
        image: "",
        maxQuantity: 99,
        total: 9.99,
        enabled: true,
      },
    ];

    const totals = calculateCartTotals(mockLines);
    assert.equal(totals.itemCount, 5);
    assert.equal(totals.subtotal, 30.99);
    assert.equal(totals.total, 30.99);
  });
});
