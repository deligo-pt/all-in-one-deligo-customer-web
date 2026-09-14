import { cookies } from "next/headers";
import type { CartCharge, CartStore } from "@/features/cart";
import type {
  Checkout,
  PlacedOrder,
  SavedAddress,
  SavedCard,
  Voucher,
} from "@/features/checkout";
import { getLocale, getTranslations } from "@/i18n/server";
import { PENDING_CHECKOUT_COOKIE, parsePendingCheckout } from "@/lib/checkout";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locale";
import { serverApi } from "@/services/api/server";
import { toLine, type RawCartItem } from "@/services/cart/server";

/**
 * Checkout, read on the server (Phase 18) — the only code that knows the
 * checkout summary's shape, measured on the owner's account:
 *
 * - `orderCalculation.itemsSubtotal` is the items after product discounts, with
 *   `totalTaxAmount` of VAT **inside** it;
 * - `serviceCharge` is **net**, with `serviceChargeVatAmount` reported beside it;
 * - `delivery.totalDeliveryCharge` is **gross**, with `vatAmount` inside it, and
 *   `distance` / `estimatedTime` are the backend's (2.88 km, 12 min);
 * - `payoutSummary.grandTotal` is what is charged, and no field is re-added to
 *   check it (9 + 0.10 + 0.02 + 3.04 = 12.16 holds, and is not our business).
 *
 * The summary names no currency; the API's catalogue and cart are in euros.
 */

type Address = {
  street?: string;
  detailedAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type RawSummary = {
  _id: string;
  vendorId?:
    | {
        _id?: string;
        businessDetails?: {
          businessName?: string;
          businessType?: { name?: string } | string;
        };
      }
    | string;
  fulfillmentType?: string;
  items?: RawCartItem[];
  orderCalculation?: {
    itemsSubtotal?: number;
    totalTaxAmount?: number;
    totalOfferDiscount?: number;
    serviceCharge?: number;
    serviceChargeVatAmount?: number;
  };
  delivery?: {
    totalDeliveryCharge?: number;
    vatAmount?: number;
    distance?: number;
    estimatedTime?: number;
  };
  payoutSummary?: { grandTotal?: number };
  offer?: {
    isApplied?: boolean;
    offerApplied?: { promoId?: string; code?: string } | null;
  };
  deliveryAddress?: Address;
  isConvertedToOrder?: boolean;
  orderId?: string | null;
};

const euros = (amount: number, locale: Locale) => formatCurrency(amount, locale, "EUR");

/** The address as one line, in the order the API's fields read. */
export function addressLine(address: Address | undefined): string {
  if (!address) return "";
  const cityLine = [address.postalCode, address.city].filter(Boolean).join(" ");
  const parts = [
    address.street,
    address.detailedAddress,
    cityLine,
    address.state,
    address.country,
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  // A geocoded street often already ends with the city and country.
  return parts
    .filter((part, i) => !parts.slice(0, i).some((p) => p.includes(part)))
    .join(", ");
}

/** What `/checkout?id=` renders; `null` when the summary is already an order. */
export async function readCheckout(
  id: string,
): Promise<{ checkout: Checkout } | { orderId: string }> {
  const [api, locale, t] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("checkout"),
  ]);
  const { data } = await api.get(`/checkout/summary/${id}`);
  const raw = data?.data as RawSummary;
  if (raw.isConvertedToOrder && raw.orderId) return { orderId: raw.orderId };

  const vendor = typeof raw.vendorId === "object" ? raw.vendorId : undefined;
  const type = vendor?.businessDetails?.businessType;
  const typeName = typeof type === "object" ? type?.name : type;
  const calc = raw.orderCalculation ?? {};
  const delivery = raw.delivery ?? {};
  const isDelivery = raw.fulfillmentType !== "PICKUP";

  const vat = (key: "vatIncluded" | "vatAdded", amount: number | undefined) =>
    amount && amount > 0 ? t(key, { amount: euros(amount, locale) }) : undefined;

  const charges: CartCharge[] = [];
  if (typeof calc.itemsSubtotal === "number")
    charges.push({
      kind: "subtotal",
      amount: euros(calc.itemsSubtotal, locale),
      note: vat("vatIncluded", calc.totalTaxAmount),
    });
  if (isDelivery && typeof delivery.totalDeliveryCharge === "number")
    charges.push({
      kind: "delivery",
      amount: euros(delivery.totalDeliveryCharge, locale),
      note: vat("vatIncluded", delivery.vatAmount),
    });
  if (calc.serviceCharge && calc.serviceCharge > 0)
    charges.push({
      kind: "service",
      amount: euros(calc.serviceCharge, locale),
      note: vat("vatAdded", calc.serviceChargeVatAmount),
    });
  const applied = raw.offer?.isApplied ? raw.offer.offerApplied : null;
  if (calc.totalOfferDiscount && calc.totalOfferDiscount > 0)
    charges.push({
      kind: "discount",
      amount: `-${euros(calc.totalOfferDiscount, locale)}`,
      code: applied?.code || undefined,
    });

  const minutes = delivery.estimatedTime ?? 0;
  const distance = delivery.distance ?? 0;
  const store: CartStore = {
    id: vendor?._id ?? "",
    vendorId: vendor?._id ?? "",
    name: vendor?.businessDetails?.businessName ?? "",
    vertical: typeName === "STORE" ? "groceries" : "food",
    lines: (raw.items ?? []).map((item) => toLine(item, locale)),
    active: true,
    deliveryEstimate:
      isDelivery && minutes > 0 ? `${formatNumber(minutes, locale)} min` : undefined,
    totals: {
      charges,
      total:
        typeof raw.payoutSummary?.grandTotal === "number"
          ? euros(raw.payoutSummary.grandTotal, locale)
          : "",
    },
  };

  const line = addressLine(raw.deliveryAddress);
  return {
    checkout: {
      id: raw._id,
      store,
      address: line
        ? {
            line,
            detail:
              distance > 0 && minutes > 0
                ? t("deliveryDetail", {
                    distance: formatNumber(distance, locale),
                    minutes: formatNumber(minutes, locale),
                  })
                : undefined,
          }
        : undefined,
      voucherCode: applied ? applied.code || applied.promoId : undefined,
    },
  };
}

type RawOffer = {
  _id: string;
  title?: string;
  description?: string;
  offerType?: string;
  isAutoApply?: boolean;
  code?: string | null;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  expiresAt?: string;
  isEligible?: boolean;
  message?: string;
  bogo?: { buyQty?: number; getQty?: number };
};

/** The offers this summary can take (`/offers/available-offers/:id`). Titles
 *  and messages arrive in the request's language. */
export async function readVouchers(
  id: string,
  appliedCode?: string,
): Promise<Voucher[]> {
  const [api, locale, t] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("checkout"),
  ]);
  const { data } = await api.get(`/offers/available-offers/${id}`);
  const offers: RawOffer[] = Array.isArray(data?.data) ? data.data : [];

  return offers.map((offer) => {
    const terms: string[] = [];
    if (offer.offerType === "PERCENT" && offer.discountValue)
      terms.push(
        t("voucherPercent", { value: formatNumber(offer.discountValue, locale) }),
      );
    if (offer.offerType === "FLAT" && offer.discountValue)
      terms.push(t("voucherFlat", { amount: euros(offer.discountValue, locale) }));
    if (offer.offerType === "BOGO" && offer.bogo?.buyQty && offer.bogo.getQty)
      terms.push(t("voucherBogo", { buy: offer.bogo.buyQty, get: offer.bogo.getQty }));
    if (offer.maxDiscountAmount)
      terms.push(t("voucherCap", { amount: euros(offer.maxDiscountAmount, locale) }));
    if (offer.minOrderAmount)
      terms.push(t("voucherMin", { amount: euros(offer.minOrderAmount, locale) }));
    if (offer.expiresAt)
      terms.push(t("voucherUntil", { date: formatDate(offer.expiresAt, locale) }));

    const identifier = offer.isAutoApply ? offer._id : (offer.code ?? "");
    const applied =
      appliedCode !== undefined &&
      (appliedCode === offer._id || (!!offer.code && appliedCode === offer.code));
    return {
      id: offer._id,
      identifier,
      title: offer.title ?? offer.code ?? "",
      code: offer.code || undefined,
      description: offer.description || undefined,
      terms: terms.join(" · ") || undefined,
      state: applied
        ? "applied"
        : offer.isEligible && identifier
          ? "available"
          : "unavailable",
      message: offer.isEligible ? undefined : offer.message || undefined,
    };
  });
}

/** The customer's saved cards, default first (the API's order). */
export async function readSavedCards(): Promise<SavedCard[]> {
  const [api, t] = await Promise.all([serverApi(), getTranslations("checkout")]);
  const { data } = await api.get("/payment-tokens");
  const cards: {
    id: string;
    label?: string;
    expiryDate?: string;
    isDefault?: boolean;
  }[] = Array.isArray(data?.data) ? data.data : [];
  return cards.map((card) => ({
    id: card.id,
    label: card.label ?? "",
    expiry: card.expiryDate ? t("savedCardExpiry", { expiry: card.expiryDate }) : "",
    isDefault: Boolean(card.isDefault),
  }));
}

/** The saved addresses the checkout can deliver to (`/profile`). */
export async function readAddresses(): Promise<SavedAddress[]> {
  const [api, t] = await Promise.all([serverApi(), getTranslations("checkout")]);
  const { data } = await api.get("/profile");
  const list: (Address & {
    _id: string;
    isActive?: boolean;
    addressType?: string;
    customAddressType?: string;
  })[] = Array.isArray(data?.data?.deliveryAddresses)
    ? data.data.deliveryAddresses
    : [];
  const labels: Record<string, string> = {
    HOME: t("addressHome"),
    OFFICE: t("addressOffice"),
    CURRENT_LOCATION: t("addressCurrent"),
  };
  return list.map((address) => ({
    id: address._id,
    label:
      address.customAddressType?.trim() ||
      labels[address.addressType ?? ""] ||
      t("addressOther"),
    line: addressLine(address),
    active: Boolean(address.isActive),
  }));
}

const METHOD_KEYS = {
  CARD: "methodCard",
  MB_WAY: "methodMbway",
  APPLE_PAY: "methodApplePay",
  PAYPAL: "methodPaypal",
  GOOGLE_PAY: "methodGooglePay",
  OTHER: "methodOther",
} as const;

/** The placed order, for the confirmation (`GET /orders/:orderId`). */
export async function readPlacedOrder(orderId: string): Promise<PlacedOrder> {
  const [api, locale, t] = await Promise.all([
    serverApi(),
    getLocale(),
    getTranslations("checkout"),
  ]);
  const { data } = await api.get(`/orders/${encodeURIComponent(orderId)}`);
  const order = data?.data ?? {};
  const methodKey = METHOD_KEYS[order.paymentMethod as keyof typeof METHOD_KEYS];
  return {
    reference: order.orderId ?? orderId,
    addressLine: addressLine(order.deliveryAddress ?? order.pickupAddress) || undefined,
    paymentLabel: methodKey ? t(methodKey) : undefined,
    paymentState: order.paymentStatus === "PAID" ? t("paymentPaid") : undefined,
    total:
      typeof order.payoutSummary?.grandTotal === "number"
        ? euros(order.payoutSummary.grandTotal, locale)
        : "",
  };
}

/** Whether this browser is waiting to finish a payment. */
export async function hasPendingCheckout(): Promise<boolean> {
  const jar = await cookies();
  return parsePendingCheckout(jar.get(PENDING_CHECKOUT_COOKIE)?.value) !== null;
}
