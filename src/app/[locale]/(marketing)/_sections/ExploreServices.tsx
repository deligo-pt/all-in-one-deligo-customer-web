import Link from "next/link";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/Card";
import { getLocale, getTranslations } from "@/i18n/server";
import { unbuiltVerticalsVisible } from "@/lib/flags";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { MessageKey } from "@/i18n/namespaces";
import { PHONE_SLIDE, PHONE_SLIDER } from "@/lib/phoneSlider";
import { cn } from "@/lib/cn";

/**
 * A 3×2 grid of 352×353 cards, each a photograph with a white 127px caption
 * panel sitting on it. 16px radius, 32px gutters, on the 1120px container.
 *
 * The whole card is the link, so the title is wrapped rather than the card
 * given a click handler — a customer clicking a picture expects to arrive
 * somewhere, and a keyboard user needs one tab stop per card, not three.
 */
// The images are the design's own, in the order the grid draws them.
const SERVICES = [
  {
    route: "food",
    title: "serviceFoodTitle",
    body: "serviceFoodBody",
    image: "/images/service-1.webp",
  },
  {
    route: "groceries",
    title: "serviceGroceriesTitle",
    body: "serviceGroceriesBody",
    image: "/images/service-2.webp",
  },
  {
    route: "ride",
    title: "serviceRideTitle",
    body: "serviceRideBody",
    image: "/images/service-3.webp",
  },
  {
    route: "hotel",
    title: "serviceHotelTitle",
    body: "serviceHotelBody",
    image: "/images/service-4.webp",
  },
  {
    route: "parcel",
    title: "serviceParcelTitle",
    body: "serviceParcelBody",
    image: "/images/service-5.webp",
  },
  {
    route: "electronics",
    title: "serviceElectronicsTitle",
    body: "serviceElectronicsBody",
    image: "/images/service-6.webp",
  },
] as const satisfies ReadonlyArray<{
  route: keyof typeof ROUTES;
  title: MessageKey<"home">;
  body: MessageKey<"home">;
  image: string;
}>;

export async function ExploreServices() {
  const [t, locale] = await Promise.all([getTranslations("home"), getLocale()]);
  const showUnbuilt = unbuiltVerticalsVisible();

  const services = SERVICES.filter(
    (service) => showUnbuilt || !("flagged" in ROUTES[service.route]),
  );

  return (
    <section className="max-w-narrow mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
      <SectionHeading
        eyebrow={t("servicesEyebrow")}
        title={t("servicesTitle")}
        body={t("servicesBody")}
      />

      {/* A swipe row on a phone — six stacked 352px cards were 2,000px of
          scrolling — and the design's grid from `sm`. See `lib/phoneSlider`. */}
      <ul className={cn("mt-8 grid gap-8 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3", PHONE_SLIDER)}>
        {services.map((service) => (
          <li key={service.route} className={PHONE_SLIDE}>
            <Card interactive className="relative h-88 overflow-hidden">
              <ImageSlot
                src={service.image}
                alt={t(service.title)}
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
                className="absolute inset-0"
              />
              <div className="bg-surface border-line-strong absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t p-4">
                <h3 className="text-20 text-brand font-semibold">
                  <Link
                    href={withLocale(ROUTES[service.route].path, locale)}
                    className="after:absolute after:inset-0"
                  >
                    {t(service.title)}
                  </Link>
                </h3>
                <p className="text-14 text-ink font-medium">{t(service.body)}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
