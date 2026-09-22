import { ImageSlot } from "@/components/shared/ImageSlot";
import { getLocale, getTranslations } from "@/i18n/server";
import { unbuiltVerticalsVisible } from "@/lib/flags";
import { ROUTES } from "@/lib/routes";
import { getDeliveryContext } from "@/services/location/server";
import { ServicePicker, type PickerService } from "./ServicePicker";

/**
 * 1440×835: a full-bleed photograph, a 56/600 white heading over it, and the
 * service picker card.
 *
 * The only section above the fold, and the only one whose image is `priority`.
 * Carried lesson from the previous project: animate **blur**, not opacity, on a
 * priority image — fading in from `opacity: 0` delays the LCP measurement to
 * the end of the animation, so the page scores as slower than it is.
 */
const SERVICES = [
  { route: "food", icon: "food" },
  { route: "groceries", icon: "groceries" },
  { route: "ride", icon: "ride" },
  { route: "hotel", icon: "hotel" },
  { route: "parcel", icon: "parcel" },
  { route: "electronics", icon: "electronics" },
] as const;

export async function Hero() {
  const [t, food, nav, locale, delivery] = await Promise.all([
    getTranslations("home"),
    // The address bar's own strings live with the vertical that owns them.
    getTranslations("food"),
    getTranslations("nav"),
    getLocale(),
    getDeliveryContext(),
  ]);
  const showUnbuilt = unbuiltVerticalsVisible();

  const services: PickerService[] = SERVICES.filter(
    (service) => showUnbuilt || !("flagged" in ROUTES[service.route]),
  ).map((service) => ({
    route: service.route,
    icon: service.icon,
    label: nav(service.route),
    available: true,
  }));

  return (
    <section className="relative isolate flex items-center overflow-hidden sm:min-h-[52rem]">
      <ImageSlot
        src="/images/hero.webp"
        alt={t("heroImageAlt")}
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10"
      />
      {/* A scrim, not decoration. The heading is white 56px over a photograph
          whose upper half is bright; without this the contrast depends on which
          part of the image happens to sit behind the text. */}
      <div
        aria-hidden
        className="from-ink-strong/70 absolute inset-0 -z-10 bg-linear-to-r to-transparent"
      />

      {/* 832px tall is the 1440px design; on a phone it left a screen of empty
          photograph under the card. There the hero is as tall as its content. */}
      <div className="max-w-shell mx-auto flex w-full flex-col gap-5 px-4 py-8 sm:gap-6 sm:px-8 sm:py-16">
        <h1 className="text-32 text-ink-inverse sm:text-40 lg:text-56 max-w-xl font-semibold tracking-tight">
          {t("heroTitle")}
        </h1>
        <div className="max-w-3xl">
          <ServicePicker
            locale={locale}
            services={services}
            locationLabel={t("heroLocationLabel")}
            exploreLabel={t("heroExplore")}
            known={delivery.location?.label || undefined}
            saved={delivery.choices}
            locationCopy={{
              savedLabel: food("savedAddresses"),
              addressLabel: t("heroLocationLabel"),
              addressPlaceholder: t("heroLocationPlaceholder"),
              locateMe: t("heroUseCurrentLocation"),
              notFound: food("locationNotFound"),
              denied: food("locationDenied"),
              unavailable: food("locationUnavailable"),
              position: food("locationPosition"),
              currentLocation: food("currentLocation"),
            }}
          />
        </div>
      </div>
    </section>
  );
}
