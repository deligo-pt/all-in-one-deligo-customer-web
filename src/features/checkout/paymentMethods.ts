import type { IconName } from "@/components/ui/Icon";

/**
 * The payment methods the design lists, in the design's order.
 *
 * **Chrome, not data — and the distinction is deliberate.** Which methods
 * DeliGo offers is a product decision drawn in the file, the same way the
 * sign-in panel's three providers were in Phase 6; it is not a list the
 * catalogue describes. What *is* the backend's is which of these a given
 * order can actually use — MB WAY is Portugal-only, Apple Pay depends on the
 * device — and Phase 18 filters this list rather than inventing a different
 * one.
 *
 * The copy lives in the dictionary, not here. This file holds the identity,
 * the order and the glyph; `verify:i18n` would fail on a user-visible string
 * that escaped it, and rightly.
 *
 * Carried from the old app (Plan.md §2.2): its live payment provider is
 * REDUNIQ, where **CARD is broken and Google Pay works**. That is a wiring
 * fact for Phase 18, and it is recorded here so that whoever wires it does not
 * rediscover it in production.
 */
export type PaymentMethodId =
  "mbway" | "card" | "apple-pay" | "paypal" | "google-pay" | "other";

export type PaymentMethod = {
  id: PaymentMethodId;
  icon: IconName;
  /** Whether choosing it reveals a form. Only the card does. */
  expands?: true;
};

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  { id: "mbway", icon: "phone" },
  { id: "card", icon: "card", expands: true },
  { id: "apple-pay", icon: "apple" },
  { id: "paypal", icon: "paypal" },
  { id: "google-pay", icon: "google" },
  { id: "other", icon: "wallet" },
];

/**
 * The tip amounts the design offers, verbatim, plus the option to decide later.
 *
 * Strings, not numbers, and never added to anything here. A tip changes the
 * total, and the total is the backend's to restate — `CartTotals` comes back
 * from the server for exactly this reason. `verify:checkout` fails on any
 * arithmetic in this feature.
 */
export const TIP_OPTIONS: readonly string[] = ["1€", "2€", "3€", "5€", "6€"];
