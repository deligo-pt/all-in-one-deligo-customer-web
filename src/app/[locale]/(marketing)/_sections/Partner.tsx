import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { getLocale, getTranslations } from "@/i18n/server";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { MessageKey } from "@/i18n/namespaces";
import { PHONE_SLIDE, PHONE_SLIDER } from "@/lib/phoneSlider";
import { cn } from "@/lib/cn";

/**
 * Four audiences — shops, hotels, couriers, drivers — each with a card and a
 * "Become a Partner" link. 1440×647.
 *
 * All four links go to `/partner`. The design draws four identical calls to
 * action and gives no evidence of four different destinations; inventing
 * `/partner/couriers` would be inventing a route nobody asked for. The link
 * text is the same on all four, so each carries its own accessible name —
 * otherwise a screen reader lists "Become a Partner" four times with no way to
 * tell them apart.
 */
const AUDIENCES = [
  { icon: "shop", title: "partnerShopsTitle", body: "partnerShopsBody" },
  { icon: "hotel", title: "partnerHotelsTitle", body: "partnerHotelsBody" },
  { icon: "parcel", title: "partnerCouriersTitle", body: "partnerCouriersBody" },
  { icon: "ride", title: "partnerDriversTitle", body: "partnerDriversBody" },
] as const satisfies ReadonlyArray<{
  icon: IconName;
  title: MessageKey<"home">;
  body: MessageKey<"home">;
}>;

export async function Partner() {
  const [t, locale] = await Promise.all([getTranslations("home"), getLocale()]);

  return (
    <section className="max-w-narrow mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
      <SectionHeading
        title={t("partnerTitle")}
        body={t("partnerBody")}
        align="center"
      />

      {/* A swipe row on a phone, the design's grid from `sm`. */}
      <ul className={cn("mt-8 grid gap-8 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4", PHONE_SLIDER)}>
        {AUDIENCES.map((audience) => (
          <li key={audience.title} className={PHONE_SLIDE}>
            <Card className="h-full">
              <CardBody className="flex h-full flex-col items-start gap-3 p-6">
                <Icon name={audience.icon} className="text-brand size-8" />
                <h3 className="text-24 text-ink font-semibold">{t(audience.title)}</h3>
                <p className="text-16 text-ink-muted flex-1 leading-relaxed">
                  {t(audience.body)}
                </p>
                <Link
                  href={withLocale(ROUTES.partner.path, locale)}
                  aria-label={`${t("partnerCta")} — ${t(audience.title)}`}
                  className="text-16 text-brand font-semibold hover:underline"
                >
                  {t("partnerCta")}
                </Link>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
