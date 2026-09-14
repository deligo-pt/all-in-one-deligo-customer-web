import type { Metadata } from "next";
import { VerticalHero } from "@/components/shared/VerticalHero";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("groceries");
  return {
    title: `${t("heroTitleLead")} ${t("heroTitleAccent")}`,
    description: t("heroBody"),
  };
}

/**
 * `/groceries` — the `Groceries` frame (1440×823), the food hero with grocery
 * words. The photograph ships: checked for D-12 and not watermarked, though its
 * source is 626×417 — the same softness the landing hero carries.
 */
export default async function GroceriesPage() {
  // The address bar and the trust line are the food hero's words, shared.
  const [t, food, locale] = await Promise.all([
    getTranslations("groceries"),
    getTranslations("food"),
    getLocale(),
  ]);

  return (
    <VerticalHero
      locale={locale}
      image="/images/groceries-hero.webp"
      href={withLocale(ROUTES.groceryStores.path, locale)}
      copy={{
        badge: t("heroBadge"),
        titleLead: t("heroTitleLead"),
        titleAccent: t("heroTitleAccent"),
        body: t("heroBody"),
        location: {
          addressLabel: food("addressLabel"),
          addressPlaceholder: food("addressPlaceholder"),
          locateMe: food("locateMe"),
          notFound: food("locationNotFound"),
          denied: food("locationDenied"),
          unavailable: food("locationUnavailable"),
          position: food("locationPosition"),
          currentLocation: food("currentLocation"),
        },
        cta: t("seeGroceries"),
        trustedBy: food("trustedBy"),
      }}
    />
  );
}
