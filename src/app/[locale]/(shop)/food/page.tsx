import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("food");
  return {
    title: `${t("heroTitleLead")} ${t("heroTitleAccent")}`,
    description: t("heroBody"),
  };
}

/**
 * `/food` — the vertical's front door.
 *
 * Measured from the `Food` frame (1440×823): a full-bleed photograph with the
 * copy on a 1120 container at the leading edge — a 37px pill at 44 radius, a
 * 48/700 headline whose second line is brand pink, a 20/400 paragraph, a
 * 560×64 address bar at 16 radius, a 205×51 call to action at 8, and a row of
 * overlapping avatars beside "Trusted by millions globally" at 12/600.
 *
 * **A Server Component with no data.** Everything here is chrome and copy, so
 * unlike the two screens behind it this page is complete rather than waiting
 * on Phase 16. The one client leaf it would need — geolocation behind "Locate
 * me" — is deliberately absent: a browser permission prompt with nowhere to
 * send the coordinates is a prompt asked for nothing. Same decision as the
 * landing page's service picker in Phase 5.
 *
 * **The hero photograph is not shipped.** The design's image is a watermarked
 * Adobe Stock comp — "Adobe Stock" tiled across it, asset #789556491, 1000×437
 * for a 1440×823 slot. `ImageSlot` renders the field instead. See D-12.
 */
export default async function FoodPage() {
  const [t, locale] = await Promise.all([getTranslations("food"), getLocale()]);

  return (
    <section className="relative isolate flex min-h-[calc(100vh-6.875rem)] items-center overflow-hidden">
      <ImageSlot
        src={undefined}
        alt={t("heroBody")}
        className="absolute inset-0 -z-10 size-full"
      />

      <div className="max-w-narrow mx-auto w-full px-8 py-16">
        <div className="flex max-w-xl flex-col items-start gap-6">
          <span className="bg-brand-tint text-brand text-14 rounded-full px-4 py-2 font-medium">
            {t("heroBadge")}
          </span>

          <h1 className="text-48 text-ink font-bold">
            {t("heroTitleLead")}
            <br />
            <span className="text-brand">{t("heroTitleAccent")}</span>
          </h1>

          <p className="text-20 text-ink-muted max-w-lg">{t("heroBody")}</p>

          {/* A real field, and nothing reads it yet — Phase 16 turns it into
              the places lookup that decides which restaurants are listed. */}
          <div className="border-line bg-surface rounded-16 flex w-full max-w-xl items-center gap-3 border p-3">
            <Input
              name="address"
              aria-label={t("addressLabel")}
              placeholder={t("addressPlaceholder")}
              startIcon={<Icon name="location" className="size-5" />}
              className="border-0 bg-transparent"
            />
            <span className="text-14 text-brand inline-flex shrink-0 items-center gap-2 pe-3 font-medium">
              <Icon name="my-location" className="size-4" />
              {t("locateMe")}
            </span>
          </div>

          <Button size="lg" className="rounded-8" asChild>
            <Link href={withLocale(ROUTES.restaurants.path, locale)}>
              {t("seeRestaurants")}
              <Icon name="chevron-right" className="size-4" />
            </Link>
          </Button>

          <p className="text-12 text-brand font-semibold">{t("trustedBy")}</p>
        </div>
      </div>
    </section>
  );
}
