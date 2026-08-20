import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAvailableDeliveryDates, canCancel, type Order } from "../lib/orders/types";
import { placeOrderSchema, cancelOrderSchema, getAdminOrdersSchema } from "../validations/order";

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

  it("evaluates canCancel correctly for order statuses", () => {
    const baseOrder: Order = {
      id: "ord_1",
      code: "ORD-123456",
      status: "placed",
      placedAt: new Date().toISOString(),
      deliveryDate: "2026-08-19",
      deliverySlot: "7:00 PM – 10:00 PM",
      subtotal: 40,
      deliveryFee: 0,
      total: 40,
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
});


