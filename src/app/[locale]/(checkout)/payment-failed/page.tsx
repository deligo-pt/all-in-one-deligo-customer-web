import type { Metadata } from "next";
import { PaymentOutcome } from "@/features/payment";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { outcomeCopy } from "@/services/checkout/copy";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("failedTitle"), robots: { index: false } };
}

/**
 * `/payment-failed` — where REDUNIQ returns a customer who did not pay
 * (Phase 18). The remembered checkout is reset for another attempt
 * (`handle-payment-failure`) and forgotten; nothing was ordered.
 */
export default async function PaymentFailedPage() {
  const [locale, copy] = await Promise.all([getLocale(), outcomeCopy()]);
  return (
    <PaymentOutcome
      kind="failed"
      ordersHref={withLocale(ROUTES.orders.path, locale)}
      cartHref={withLocale(ROUTES.cart.path, locale)}
      homeHref={withLocale(ROUTES.home.path, locale)}
      copy={copy}
    />
  );
}
