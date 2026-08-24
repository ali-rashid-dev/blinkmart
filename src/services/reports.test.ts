import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  getCategoryEmoji,
  formatCurrency,
  calculateDelta,
  getInitials,
} from "@/lib/reports/format";
import {
  buildSeriesForRange,
  buildMonthlySeries,
  buildBestSellingItems,
  buildCustomerInsights,
} from "./reports.service";
import type { RawReportOrder } from "@/repositories/reports.repository";

describe("Reports Service & Helper Utilities", () => {
  test("getCategoryEmoji extracts emoji from category name or fallback map", () => {
    assert.equal(getCategoryEmoji("🥦 Fresh Produce", "fresh-produce"), "🥦");
    assert.equal(getCategoryEmoji("Dairy & Eggs", "dairy-eggs"), "🥛");
    assert.equal(getCategoryEmoji("Unknown Category", "unknown-slug"), "📦");
  });

  test("formatCurrency formats numbers as Pakistan Rupee currency", () => {
    assert.equal(formatCurrency(1250), "Rs 1,250");
    assert.equal(formatCurrency(29.77), "Rs 29.77");
  });

  test("calculateDelta calculates percentage change accurately", () => {
    assert.equal(calculateDelta(150, 100), 50.0);
    assert.equal(calculateDelta(50, 100), -50.0);
    assert.equal(calculateDelta(100, 0), 100.0);
    assert.equal(calculateDelta(0, 0), 0.0);
  });

  test("getInitials extracts two capital initials from name", () => {
    assert.equal(getInitials("Alice Smith"), "AS");
    assert.equal(getInitials("Bob"), "BO");
    assert.equal(getInitials("   Charlie   Brown  "), "CB");
  });

  test("buildSeriesForRange generates 7 points for '7d'", () => {
    const refDate = new Date("2026-08-21T12:00:00Z");
    const mockOrders: RawReportOrder[] = [
      {
        id: "order-1",
        total: 100,
        createdAt: new Date("2026-08-21T10:00:00Z"),
        userId: "user-1",
        user: { id: "user-1", name: "Alice", email: "alice@test.com" },
        area: "North",
        city: "City",
        items: [],
      },
    ];

    const points = buildSeriesForRange(mockOrders, "7d", refDate);
    assert.equal(points.length, 7);
    const lastPoint = points[points.length - 1];
    assert.equal(lastPoint.value, 100);
    assert.equal(lastPoint.orders, 1);
  });

  test("buildMonthlySeries generates 12 monthly points", () => {
    const refDate = new Date("2026-08-21T12:00:00Z");
    const points = buildMonthlySeries([], refDate);
    assert.equal(points.length, 12);
    assert.equal(points.every((p) => p.value === 0), true);
  });

  test("buildBestSellingItems groups product items and calculates percentage share", () => {
    const mockOrders: RawReportOrder[] = [
      {
        id: "order-1",
        total: 150,
        createdAt: new Date(),
        userId: "user-1",
        user: { id: "user-1", name: "Alice", email: "a@test.com" },
        area: "North",
        city: "City",
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            name: "Organic Avocados",
            price: 5,
            quantity: 10,
            product: {
              id: "prod-1",
              name: "Organic Avocados",
              category: { id: "cat-1", name: "🥦 Fresh Produce", slug: "fresh-produce" },
            },
          },
          {
            id: "item-2",
            productId: "prod-2",
            name: "Whole Milk",
            price: 4,
            quantity: 5,
            product: {
              id: "prod-2",
              name: "Whole Milk",
              category: { id: "cat-2", name: "🥛 Dairy", slug: "dairy-eggs" },
            },
          },
        ],
      },
    ];

    const bestSellers = buildBestSellingItems(mockOrders);
    assert.equal(bestSellers.length, 2);
    assert.equal(bestSellers[0].name, "Organic Avocados");
    assert.equal(bestSellers[0].units, 10);
    assert.equal(bestSellers[0].share, 66.7);
    assert.equal(bestSellers[1].name, "Whole Milk");
    assert.equal(bestSellers[1].units, 5);
    assert.equal(bestSellers[1].share, 33.3);
  });

  test("buildCustomerInsights classifies customers correctly", () => {
    const stats = [
      {
        userId: "u1",
        userName: "Alice Cooper",
        userEmail: "alice@test.com",
        area: "Downtown",
        city: "Metropolis",
        orderCount: 1,
        totalSpent: 40,
      },
      {
        userId: "u2",
        userName: "Bob Dylan",
        userEmail: "bob@test.com",
        area: "Uptown",
        city: "Metropolis",
        orderCount: 3,
        totalSpent: 150,
      },
      {
        userId: "u3",
        userName: "Charlie Parker",
        userEmail: "charlie@test.com",
        area: "Westside",
        city: "Metropolis",
        orderCount: 6,
        totalSpent: 600,
      },
    ];

    const { customerMix, topCustomers } = buildCustomerInsights(stats);
    assert.equal(customerMix.find((m) => m.label === "New customers")?.value, 1);
    assert.equal(customerMix.find((m) => m.label === "Returning")?.value, 1);
    assert.equal(customerMix.find((m) => m.label === "VIP")?.value, 1);

    assert.equal(topCustomers[0].name, "Charlie Parker");
    assert.equal(topCustomers[0].status, "vip");
    assert.equal(topCustomers[0].initials, "CP");
  });
});
