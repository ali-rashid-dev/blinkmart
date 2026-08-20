"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { cartStore, cartTotals, formatPrice, useCartState } from "@/lib/cart/store";
import { formatMoney } from "@/lib/orders/store";
import { getAvailableDeliveryDates, DELIVERY_WINDOW, type DeliveryDateOption } from "@/lib/orders/types";
import { DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/orders/eligibility";
import { placeOrderAction } from "./actions";
import { getProfile } from "../profile/actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { status, lines } = useCartState();
  const activeLines = lines.filter((l) => l.enabled);
  const { subtotal, itemCount } = cartTotals(activeLines);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  // Delivery dates based on 5:00 PM cutoff rule
  const [deliveryDateOptions, setDeliveryDateOptions] = useState<DeliveryDateOption[]>([]);
  const [selectedDateIso, setSelectedDateIso] = useState<string>("");

  // Address form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [house, setHouse] = useState("");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Metropolis");
  const [postal, setPostal] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    void cartStore.load();
    const dates = getAvailableDeliveryDates(new Date());
    setDeliveryDateOptions(dates);
    if (dates.length > 0) {
      setSelectedDateIso(dates[0]!.dateIso);
    }

    // Attempt to load existing user profile address to prefill
    async function loadAddress() {
      try {
        const res = await getProfile();
        if (res.success && res.data) {
          if (res.data.name) setFullName(res.data.name);
          if (res.data.phone) setPhone(res.data.phone);
          if (res.data.houseNo) setHouse(res.data.houseNo);
          if (res.data.street) setStreet(res.data.street);
          if (res.data.area) setArea(res.data.area);
          if (res.data.city) setCity(res.data.city);
          if (res.data.postalCode) setPostal(res.data.postalCode);
        }
      } catch {
        // Fallback silently if unauthenticated or error
      } finally {
        setLoadingProfile(false);
      }
    }

    void loadAddress();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (activeLines.length === 0) {
      setFormError("Your cart is empty. Add items to your cart before checking out.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await placeOrderAction({
        fullName,
        phone,
        house,
        street,
        area,
        city,
        postal,
        notes: notes || undefined,
        deliveryDate: selectedDateIso,
      });

      if (res.success) {
        toast.success("Order placed successfully!", {
          description: `Order ${res.data.code} scheduled for ${selectedDateIso}, 7:00 PM – 10:00 PM.`,
        });
        void cartStore.load(true);
        router.push(`/orders/${res.data.id}`);
      } else {
        if (res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        }
        setFormError(res.error.message);
        toast.error("Could not place order", { description: res.error.message });
      }
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" && lines.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading checkout details...</p>
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted/60 text-muted-foreground">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add fresh groceries to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <ArrowLeft className="size-4" />
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Cart
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Checkout</h1>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-1.5 text-xs font-medium text-secondary sm:flex">
          <ShieldCheck className="size-4" />
          Secure 1-Click Order
        </div>
      </div>

      {formError && (
        <div role="alert" className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {/* 1. Fixed Delivery Time Section */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
                  <CalendarClock className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Fixed Delivery Window</h2>
                  <p className="text-xs text-muted-foreground">Every BlinkMart order delivers in our evening slot</p>
                </div>
              </div>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                {DELIVERY_WINDOW.label}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-secondary/20 bg-secondary/5 p-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-secondary" />
                <span>
                  Orders placed before <strong>5:00 PM</strong> qualify for same-day delivery between <strong>7:00 PM – 10:00 PM</strong>. Orders after 5:00 PM are scheduled for tomorrow evening.
                </span>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Select Delivery Date
              </label>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                {deliveryDateOptions.map((opt) => {
                  const isSelected = selectedDateIso === opt.dateIso;
                  return (
                    <button
                      key={opt.dateIso}
                      type="button"
                      onClick={() => setSelectedDateIso(opt.dateIso)}
                      className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border bg-card hover:bg-accent/50"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{DELIVERY_WINDOW.label}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="size-5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 2. Delivery Address Section */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Delivery Address</h2>
                <p className="text-xs text-muted-foreground">Where should we drop off your groceries?</p>
              </div>
            </div>

            {loadingProfile && (
              <p className="mt-4 text-xs text-muted-foreground animate-pulse">Loading saved address details...</p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.fullName && <p className="mt-1 text-xs text-destructive">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.phone && <p className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label htmlFor="house" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  House / Apt / Suite *
                </label>
                <input
                  id="house"
                  type="text"
                  required
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  placeholder="Apt 4B, Building 12"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.house && <p className="mt-1 text-xs text-destructive">{fieldErrors.house}</p>}
              </div>

              <div>
                <label htmlFor="street" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Street Name *
                </label>
                <input
                  id="street"
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.street && <p className="mt-1 text-xs text-destructive">{fieldErrors.street}</p>}
              </div>

              <div>
                <label htmlFor="area" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Area / Neighborhood *
                </label>
                <input
                  id="area"
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Downtown / Sector 4"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.area && <p className="mt-1 text-xs text-destructive">{fieldErrors.area}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Springfield"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.city && <p className="mt-1 text-xs text-destructive">{fieldErrors.city}</p>}
              </div>

              <div>
                <label htmlFor="postal" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Postal Code *
                </label>
                <input
                  id="postal"
                  type="text"
                  required
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="90210"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.postal && <p className="mt-1 text-xs text-destructive">{fieldErrors.postal}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Delivery Notes (Optional)
                </label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ring doorbell or leave at front desk"
                  className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar: Order Items & Payment Summary */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-6">
            <h2 className="font-display text-lg font-bold text-foreground">Order Summary</h2>

            {/* Items snippet */}
            <ul className="mt-4 max-h-56 divide-y divide-border overflow-y-auto pr-1">
              {activeLines.map((line) => (
                <li key={line.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-foreground">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {line.quantity} × {formatPrice(line.price)}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatPrice(line.total)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </dt>
                <dd className="font-semibold tabular-nums text-foreground">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Evening Delivery Fee</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {deliveryFee === 0 ? (
                    <span className="text-success font-bold">FREE</span>
                  ) : (
                    formatMoney(deliveryFee)
                  )}
                </dd>
              </div>

              {deliveryFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatMoney(FREE_DELIVERY_THRESHOLD - subtotal)} more for FREE evening delivery!
                </p>
              )}

              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-bold text-foreground">Total</dt>
                <dd className="font-display text-xl font-bold tabular-nums text-foreground">
                  {formatMoney(total)}
                </dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Placing order...
                </>
              ) : (
                <>
                  Place Order
                  <ChevronRight className="size-5" />
                </>
              )}
            </button>
          </section>
        </div>
      </form>
    </main>
  );
}
