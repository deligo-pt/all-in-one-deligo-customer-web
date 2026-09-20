import type { Cart, CartLine, CartStore } from "@/features/cart";
import { getLocale } from "@/i18n/server";
import { formatCurrency } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locale";
import { hasServerSession, serverApi } from "@/services/api/server";

export type RawCartItem = {
  productId: string;
  name?: string;
  image?: string;
  variationSku?: string | null;
  isActive?: boolean;
  addons?: {
    name?: string;
    sku?: string;
    quantity?: number;
    /** The add-on's own total for this line, the backend's arithmetic. */
    lineTotal?: number;
  }[];
  vendorId?:
    | {
        _id?: string;
        businessDetails?: { businessName?: string; businessType?: string };
      }
    | string;
  itemSummary?: { quantity?: number; grandTotal?: number };
};

type RawCart = {
  items?: RawCartItem[];
  cartCalculation?: {
    totalOriginalPrice?: number;
    totalProductDiscount?: number;
    grandTotal?: number;
  };
};

const money = (amount: number | undefined, locale: Locale) =>
  typeof amount === "number" ? formatCurrency(amount, locale, "EUR") : undefined;

const vendorOf = (item: RawCartItem) =>
  typeof item.vendorId === "object" ? item.vendorId : undefined;

export function toLine(item: RawCartItem, locale: Locale): CartLine {
  const addons = (item.addons ?? [])
    .filter((a) => a.name)
    .map((a) => ((a.quantity ?? 1) > 1 ? `${a.name} ×${a.quantity}` : a.name!));
  // The same add-ons as rows, for the cart page's steppers (Phase 20e). Only
  // those with an `sku`: without one there is nothing to send back, and a
  // control that cannot write is worse than a line of text.
  const addonRows = (item.addons ?? [])
    .filter((a) => a.sku && a.name)
    .map((a) => ({
      sku: a.sku!,
      name: a.name!,
      quantity: a.quantity ?? 1,
      price: money(a.lineTotal, locale),
    }));
  return {
    id: `${item.productId}::${item.variationSku ?? ""}`,
    productId: item.productId,
    variationSku: item.variationSku ?? undefined,
    name: item.name ?? "",
    image: item.image || undefined,
    price: money(item.itemSummary?.grandTotal, locale) ?? "",
    quantity: item.itemSummary?.quantity ?? 1,
    optionsLabel: addons.length ? addons.join(" · ") : undefined,
    addons: addonRows,
  };
}

/**
 * The cart, read on the server (Phase 17). `null` without a session — a guest
 * has no cart, and the API answers 401.
 *
 * Stores are grouped by vendor, most recently added first (the old app's
 * order). Only the active store carries totals: `cartCalculation` is the
 * backend's sum over active lines, and the API keeps one store active.
 */
export async function readCart(): Promise<Cart | null> {
  if (!(await hasServerSession())) return null;
  const [api, locale] = await Promise.all([serverApi(), getLocale()]);
  const { data } = await api.get("/carts/view-cart");
  const raw = (data?.data ?? {}) as RawCart;
  const items = raw.items ?? [];

  const firstSeen = new Map<string, number>();
  items.forEach((item, index) => {
    const id = vendorOf(item)?._id ?? "";
    if (id && !firstSeen.has(id)) firstSeen.set(id, index);
  });
  const order = [...firstSeen.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);

  const calc = raw.cartCalculation ?? {};
  const stores: CartStore[] = order.map((vendorId) => {
    const own = items.filter((item) => vendorOf(item)?._id === vendorId);
    const details = vendorOf(own[0]!)?.businessDetails ?? {};
    const active = own.some((item) => item.isActive);
    const discount = calc.totalProductDiscount ?? 0;
    return {
      id: vendorId,
      vendorId,
      name: details.businessName ?? "",
      vertical: details.businessType === "STORE" ? "groceries" : "food",
      lines: own.map((item) => toLine(item, locale)),
      active,
      ...(active
        ? {
            subtotal: money(calc.grandTotal, locale),
            totals: {
              charges: [
                {
                  kind: "subtotal" as const,
                  amount: money(calc.totalOriginalPrice, locale) ?? "",
                },
                ...(discount > 0
                  ? [
                      {
                        kind: "discount" as const,
                        amount: `-${money(discount, locale)}`,
                      },
                    ]
                  : []),
              ],
              total: money(calc.grandTotal, locale) ?? "",
            },
          }
        : {}),
    };
  });

  const activeStore = stores.find((store) => store.active);
  return { stores, total: activeStore?.totals?.total };
}
