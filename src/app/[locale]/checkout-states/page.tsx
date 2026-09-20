import { notFound } from "next/navigation";
import { CheckoutView } from "@/features/checkout";
import { PaymentOutcome } from "@/features/payment";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import type { Messages } from "@/lib/i18n/translate";
import {
  ADDRESS_FIXTURE,
  CARD_FIXTURE,
  CHECKOUT_FIXTURE,
  PLACED_FIXTURE,
  VOUCHER_FIXTURE,
} from "./fixture";
import { checkoutCopy, outcomeCopy } from "./copy";

/**
 * Checkout, in its populated state, against the design's sample content.
 *
 * **Development only, and it 404s in production.** `/checkout` is live since
 * Phase 18, so this page exists to review the layout with content the test
 * account does not have: an applied voucher, two addresses, a saved card. It is
 * **offline** — every write refuses with `previewOnly`, so nothing is sent to
 * the API from here. The confirmation dialog renders below it.
 */
export default async function CheckoutStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [checkout, cart, food, common, nav] = await Promise.all([
    loadNamespace(locale, "checkout"),
    loadNamespace(locale, "cart"),
    loadNamespace(locale, "food"),
    loadNamespace(locale, "common"),
    loadNamespace(locale, "nav"),
  ]);

  const lookup = (messages: Messages) => (key: string) => messages[key] ?? key;
  const t = lookup(checkout);

  return (
    <TranslationProvider locale={locale} messages={{ common, checkout, cart, nav }}>
      <div className="flex flex-col gap-16 py-8">
        <CheckoutView
          checkout={CHECKOUT_FIXTURE}
          vouchers={VOUCHER_FIXTURE}
          cards={CARD_FIXTURE}
          addresses={ADDRESS_FIXTURE}
          pickupHours={{ openingHours: "07:00", closingHours: "23:30" }}
          pickupAvailable
          locale={locale}
          copy={checkoutCopy(t, lookup(cart), lookup(food))}
          offlineNotice={t("previewOnly")}
        />
        <PaymentOutcome
          kind="confirmed"
          order={PLACED_FIXTURE}
          homeHref={`/${locale}`}
          ordersHref={`/${locale}/checkout-states`}
          cartHref={`/${locale}/checkout-states`}
          copy={outcomeCopy(t)}
        />
      </div>
    </TranslationProvider>
  );
}
