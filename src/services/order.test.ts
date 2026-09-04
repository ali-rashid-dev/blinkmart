import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAvailableDeliveryDates, canCancel, type Order } from "../lib/orders/types";
import {
  calculateDeliveryFee,
  calculatePlatformFee,
  calculateOrderTotals,
  getNextDeliveryTier,
} from "../lib/orders/eligibility";
import {
  placeOrderSchema,
  cancelOrderSchema,
  getAdminOrdersSchema,
  updateOrderStatusSchema,
} from "../validations/order";

describe("Order Module Service & Utilities", () => {
  it("computes delivery date options before 5:00 PM cutoff", () => {
    // Local date 2026-08-19 14:00 (2:00 PM)
    const mockTimeBeforeCutoff = new Date(2026, 7, 19, 14, 0, 0);
    const options = getAvailableDeliveryDates(mockTimeBeforeCutoff);

    assert.equal(options.length, 2);
    assert.equal(options[0]?.isDefault, true);
    assert.equal(options[0]?.dateIso, "2026-08-19");
    assert.match(options[0]?.label || "", /Today/);
    assert.equal(options[1]?.dateIso, "2026-08-20");
    assert.match(options[1]?.label || "", /Tomorrow/);
  });

  it("computes delivery date options after 5:00 PM cutoff", () => {
    // Local date 2026-08-19 18:00 (6:00 PM)
    const mockTimeAfterCutoff = new Date(2026, 7, 19, 18, 0, 0);
    const options = getAvailableDeliveryDates(mockTimeAfterCutoff);

    assert.equal(options.length, 2);
    assert.equal(options[0]?.isDefault, true);
    assert.equal(options[0]?.dateIso, "2026-08-20");
    assert.match(options[0]?.label || "", /Tomorrow/);
  });

  it("treats the 5:00 PM cutoff as inclusive", () => {
    const mockTimeAtCutoff = new Date(2026, 7, 19, 17, 0, 0);
    const options = getAvailableDeliveryDates(mockTimeAtCutoff);

    assert.equal(options.length, 2);
    assert.equal(options[0]?.dateIso, "2026-08-20");
    assert.equal(options[0]?.isDefault, true);
  });

  it("trims address fields before validation and rejects whitespace-only values", () => {
    const validData = {
      fullName: "John Doe",
      phone: "+15551234567",
      house: "  42  ",
      street: "  Maple Street  ",
      area: "  Central  ",
      city: "  Lahore  ",
      postal: " 54000 ",
      deliveryDate: "2026-08-20",
    };

    const parsed = placeOrderSchema.safeParse(validData);
    assert.equal(parsed.success, true);

    if (parsed.success) {
      assert.equal(parsed.data.house, "42");
      assert.equal(parsed.data.street, "Maple Street");
      assert.equal(parsed.data.area, "Central");
      assert.equal(parsed.data.city, "Lahore");
      assert.equal(parsed.data.postal, "54000");
    }

    const invalid = {
      ...validData,
      house: "   ",
      street: "\t",
      area: "\n",
      city: " ",
      postal: "  ",
    };

    assert.equal(placeOrderSchema.safeParse(invalid).success, false);
  });

  it("rejects invalid lifecycle status transitions", () => {
    const res = updateOrderStatusSchema.safeParse({
      orderId: "ord_123",
      status: "PLACED",
    });

    assert.equal(res.success, true);

    const invalidTransition = updateOrderStatusSchema.safeParse({
      orderId: "ord_123",
      status: "PLACED",
      currentStatus: "delivered",
    });

    assert.equal(invalidTransition.success, false);
    if (!invalidTransition.success) {
      const msg = invalidTransition.error.issues[0]?.message || "";
      assert.match(msg, /Status PLACED is not allowed from delivered/);
    }
  });

  it("evaluates canCancel correctly for order statuses", () => {
    const baseOrder: Order = {
      id: "ord_1",
      code: "ORD-123456",
      status: "placed",
      placedAt: new Date().toISOString(),
      deliveryDate: "2026-08-19",
      deliverySlot: "7:00 PM – 10:00 PM",
      subtotal: 40,
      deliveryFee: 100,
      platformFee: 20,
      total: 160,
      address: {
        fullName: "Jane Doe",
        phone: "+1234567890",
        house: "123",
        street: "Main St",
        area: "Downtown",
        city: "Metropolis",
        postal: "10001",
      },
      items: [],
      timeline: [],
    };

    assert.equal(canCancel({ ...baseOrder, status: "placed" }), true);
    assert.equal(canCancel({ ...baseOrder, status: "confirmed" }), true);
    assert.equal(canCancel({ ...baseOrder, status: "packed" }), true);
    assert.equal(canCancel({ ...baseOrder, status: "out_for_delivery" }), false);
    assert.equal(canCancel({ ...baseOrder, status: "delivered" }), false);
    assert.equal(canCancel({ ...baseOrder, status: "cancelled" }), false);
  });

  it("validates placeOrderSchema successfully", () => {
    const validData = {
      fullName: "John Doe",
      phone: "+15551234567",
      house: "Apt 4B",
      street: "Green Street",
      area: "North District",
      city: "Springfield",
      postal: "90210",
      notes: "Leave near front door",
      deliveryDate: "2026-08-20",
    };

    const res = placeOrderSchema.safeParse(validData);
    assert.equal(res.success, true);
  });

  it("rejects invalid placeOrderSchema with missing fields", () => {
    const invalidData = {
      fullName: "J",
      phone: "123",
      house: "",
      street: "",
      area: "",
      city: "",
      postal: "",
      deliveryDate: "",
    };

    const res = placeOrderSchema.safeParse(invalidData);
    assert.equal(res.success, false);
  });

  it("validates cancelOrderSchema", () => {
    const validData = { orderId: "ord_100", reason: "Changed my mind" };
    assert.equal(cancelOrderSchema.safeParse(validData).success, true);

    const invalidData = { orderId: "", reason: "" };
    assert.equal(cancelOrderSchema.safeParse(invalidData).success, false);
  });

  it("validates getAdminOrdersSchema with empty string defaults and sanitized filters", () => {
    const emptyFilters = {
      search: "",
      status: "all",
      deliveryDate: "",
      page: 1,
      limit: 10,
    };
    const parsedEmpty = getAdminOrdersSchema.safeParse(emptyFilters);
    assert.equal(parsedEmpty.success, true);
    if (parsedEmpty.success) {
      assert.equal(parsedEmpty.data.search, undefined);
      assert.equal(parsedEmpty.data.status, undefined);
      assert.equal(parsedEmpty.data.deliveryDate, undefined);
      assert.equal(parsedEmpty.data.page, 1);
      assert.equal(parsedEmpty.data.limit, 10);
    }

    const validFilters = {
      search: "  ORD-123  ",
      status: "placed",
      deliveryDate: "2026-08-20",
      page: "2",
      limit: "20",
    };
    const parsedValid = getAdminOrdersSchema.safeParse(validFilters);
    assert.equal(parsedValid.success, true);
    if (parsedValid.success) {
      assert.equal(parsedValid.data.search, "ORD-123");
      assert.equal(parsedValid.data.status, "PLACED");
      assert.equal(parsedValid.data.deliveryDate, "2026-08-20");
      assert.equal(parsedValid.data.page, 2);
      assert.equal(parsedValid.data.limit, 20);
    }

    const invalidStatus = { status: "INVALID_STATUS" };
    assert.equal(getAdminOrdersSchema.safeParse(invalidStatus).success, false);

    const invalidDate = { deliveryDate: "2026-02-31" };
    assert.equal(getAdminOrdersSchema.safeParse(invalidDate).success, false);
  });

  it("correctly calculates tiered delivery fee and platform fee", () => {
    // Tier 1: 0 - 999 -> Delivery Rs 100, Platform Rs 20
    assert.equal(calculateDeliveryFee(500), 100);
    assert.equal(calculatePlatformFee(500), 20);
    assert.deepEqual(calculateOrderTotals(500), {
      subtotal: 500,
      deliveryFee: 100,
      platformFee: 20,
      total: 620,
    });

    // Tier 2: 1000 - 1999 -> Delivery Rs 70, Platform Rs 20
    assert.equal(calculateDeliveryFee(1500), 70);
    assert.equal(calculatePlatformFee(1500), 20);
    assert.deepEqual(calculateOrderTotals(1500), {
      subtotal: 1500,
      deliveryFee: 70,
      platformFee: 20,
      total: 1590,
    });

    // Tier 3: 2000 - 2999 -> Delivery Rs 40, Platform Rs 20
    assert.equal(calculateDeliveryFee(2500), 40);
    assert.equal(calculatePlatformFee(2500), 20);
    assert.deepEqual(calculateOrderTotals(2500), {
      subtotal: 2500,
      deliveryFee: 40,
      platformFee: 20,
      total: 2560,
    });

    // Tier 4: 3000+ -> Free delivery, Platform Rs 20
    assert.equal(calculateDeliveryFee(3500), 0);
    assert.equal(calculatePlatformFee(3500), 20);
    assert.deepEqual(calculateOrderTotals(3500), {
      subtotal: 3500,
      deliveryFee: 0,
      platformFee: 20,
      total: 3520,
    });

    // Subtotal = 0 -> Delivery Rs 0, Platform Rs 0
    assert.equal(calculateDeliveryFee(0), 0);
    assert.equal(calculatePlatformFee(0), 0);
    assert.deepEqual(calculateOrderTotals(0), {
      subtotal: 0,
      deliveryFee: 0,
      platformFee: 0,
      total: 0,
    });
  });

  it("calculates next delivery tier thresholds correctly", () => {
    assert.deepEqual(getNextDeliveryTier(500), {
      nextThreshold: 1000,
      amountNeeded: 500,
      isFree: false,
      nextFee: 70,
    });

    assert.deepEqual(getNextDeliveryTier(1500), {
      nextThreshold: 2000,
      amountNeeded: 500,
      isFree: false,
      nextFee: 40,
    });

    assert.deepEqual(getNextDeliveryTier(2500), {
      nextThreshold: 3000,
      amountNeeded: 500,
      isFree: true,
      nextFee: 0,
    });

    assert.deepEqual(getNextDeliveryTier(3500), {
      nextThreshold: 3000,
      amountNeeded: 0,
      isFree: true,
      nextFee: 0,
    });
  });
});


