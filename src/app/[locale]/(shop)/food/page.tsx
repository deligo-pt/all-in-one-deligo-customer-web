import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerticalHero } from "@/components/shared/VerticalHero";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { getDeliveryLocation } from "@/services/location/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("food");
  return {
    title: `${t("heroTitleLead")} ${t("heroTitleAccent")}`,
    description: t("heroBody"),
  };
}

/**
 * `/food` — the vertical's front door, from the `Food` frame (1440×823).
 *
 * **The hero photograph is not shipped.** The design's image is a watermarked
 * Adobe Stock comp — asset #789556491, 1000×437 for a 1440×823 slot — so the
 * placeholder field renders instead. See D-12.
 */
export default async function FoodPage() {
  const [t, locale, placed] = await Promise.all([
    getTranslations("food"),
    getLocale(),
    getDeliveryLocation(),
  ]);

  // A customer we can already place is sent to the results rather than asked a
  // question we know the answer to (Phase 20n). The listing carries the
  // address picker on its delivery card, so this is a door and not a gate.
  if (placed) redirect(withLocale(ROUTES.restaurants.path, locale));

  return (
    <VerticalHero
      locale={locale}
      href={withLocale(ROUTES.restaurants.path, locale)}
      copy={{
        badge: t("heroBadge"),
        titleLead: t("heroTitleLead"),
        titleAccent: t("heroTitleAccent"),
        body: t("heroBody"),
        location: {
          addressLabel: t("addressLabel"),
          addressPlaceholder: t("addressPlaceholder"),
          locateMe: t("locateMe"),
          notFound: t("locationNotFound"),
          denied: t("locationDenied"),
          unavailable: t("locationUnavailable"),
          position: t("locationPosition"),
          currentLocation: t("currentLocation"),
        },
        cta: t("seeRestaurants"),
        trustedBy: t("trustedBy"),
      }}
    />
  );
}
