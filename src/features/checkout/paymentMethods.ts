import type { IconName } from "@/components/ui/Icon";

/**
 * The payment methods the design lists, in the design's order, each with the
 * value `POST /payment/reduniq/create-payment-intent` takes for it.
 *
 * All six are the API's (`CARD`, `MB_WAY`, `APPLE_PAY`, `PAYPAL`, `GOOGLE_PAY`,
 * `OTHER` — the collection lists exactly these), and every one of them is
 * paid on REDUNIQ's own page. Nothing about a card is typed into this site
 * (D-14): saved cards are tokens, and "save this card" is a flag the gateway
 * honours on its page.
 *
 * The copy lives in the dictionary; this file holds identity, order and glyph.
 */
export type PaymentMethodId =
  "mbway" | "card" | "apple-pay" | "paypal" | "google-pay" | "other";

export type PaymentMethod = {
  id: PaymentMethodId;
  icon: IconName;
  /** The API's enum value. */
  api: string;
};

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  { id: "mbway", icon: "phone", api: "MB_WAY" },
  { id: "card", icon: "card", api: "CARD" },
  { id: "apple-pay", icon: "apple", api: "APPLE_PAY" },
  { id: "paypal", icon: "paypal", api: "PAYPAL" },
  { id: "google-pay", icon: "google", api: "GOOGLE_PAY" },
  { id: "other", icon: "wallet", api: "OTHER" },
];
