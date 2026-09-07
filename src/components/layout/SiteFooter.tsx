import Link from "next/link";
import { getLocale, getTranslations } from "@/i18n/server";
import { unbuiltVerticalsVisible } from "@/lib/flags";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES, type RouteName } from "@/lib/routes";
import type { MessageKey } from "@/i18n/namespaces";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

/**
 * Measured: a pale pink field, a brand block, four link columns and a
 * newsletter across a 1270px container, then a legal bar.
 *
 * The design's footer background is `#FEECEB` and its text is brand pink
 * throughout. `#FEECEB` is not a token — it is two or three values away from
 * `brand-tint` (`#FCEAF1`) and the two are indistinguishable side by side, so
 * it snaps rather than becoming a twenty-seventh colour. Recorded in Plan.md §4
 * with the rest of the snapped values.
 *
 * Worth knowing before Phase 23: brand pink on that tint measures about 4.6:1,
 * which clears AA for body text and does not clear AAA. Every footer link is at
 * that ratio.
 */

const SERVICE_LINKS = [
  { route: "food", key: "foodDelivery" },
  { route: "groceries", key: "groceryDelivery" },
  { route: "ride", key: "rideBooking" },
  { route: "hotel", key: "hotelBooking" },
  { route: "parcel", key: "parcelDelivery" },
  { route: "electronics", key: "electronics" },
] as const satisfies ReadonlyArray<{ route: RouteName; key: MessageKey<"footer"> }>;

const COMPANY_LINKS = [
  { route: "about", key: "aboutDeligo" },
  { route: "ourStory", key: "ourStory" },
  { route: "careers", key: "careers" },
  { route: "blog", key: "blog" },
  { route: "press", key: "press" },
  { route: "contact", key: "contact" },
] as const satisfies ReadonlyArray<{ route: RouteName; key: MessageKey<"footer"> }>;

const SUPPORT_LINKS = [
  { route: "help", key: "helpCenter" },
  { route: "helpDelivery", key: "deliveryInformation" },
  { route: "helpReturns", key: "returns" },
  { route: "trackOrder", key: "trackOrder" },
  { route: "faqs", key: "faqs" },
  { route: "contact", key: "customerSupport" },
] as const satisfies ReadonlyArray<{ route: RouteName; key: MessageKey<"footer"> }>;

const WHY_POINTS = ["whyFast", "whyPartners", "whyPayments", "whySupport"] as const;

/** Card marks are brand names. They are not translated, and they are not
 *  images yet — the design's marks have no exportable asset. Phase 24. */
const PAYMENT_MARKS = ["Visa", "Mastercard", "MB WAY", "Apple Pay", "Google Pay"];

export async function SiteFooter() {
  const [t, common, locale] = await Promise.all([
    getTranslations("footer"),
    getTranslations("common"),
    getLocale(),
  ]);
  const showUnbuilt = unbuiltVerticalsVisible();

  const href = (route: RouteName) => withLocale(ROUTES[route].path, locale);
  const visible = <T extends { route: RouteName }>(links: readonly T[]) =>
    links.filter((link) => showUnbuilt || !("flagged" in ROUTES[link.route]));

  const columns = [
    { heading: "servicesHeading", links: visible(SERVICE_LINKS) },
    { heading: "companyHeading", links: COMPANY_LINKS },
    { heading: "supportHeading", links: SUPPORT_LINKS },
  ] as const;

  return (
    <footer className="bg-brand-tint border-line text-brand border-t">
      <div className="max-w-shell mx-auto flex flex-col gap-14 px-8 py-16">
        <div className="border-brand-soft flex flex-col gap-4 border-b pb-10">
          <Logo locale={locale} label={common("appName")} size="lg" />
          <p className="text-16 max-w-2xl">{t("description")}</p>
          <p className="text-12">{t("promise")}</p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-18">
          {columns.map((column) => (
            <nav key={column.heading} aria-label={t(column.heading)}>
              <h2 className="text-16 mb-4 font-semibold">{t(column.heading)}</h2>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link href={href(link.route)} className="text-16 hover:underline">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-16 mb-4 font-semibold">{t("whyHeading")}</h2>
            <ul className="flex flex-col gap-3">
              {WHY_POINTS.map((point) => (
                <li key={point} className="text-16">
                  {t(point)}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-16 font-semibold">{t("newsletterHeading")}</h2>
            <p className="text-12">{t("newsletterBody")}</p>
            <NewsletterForm
              placeholder={t("emailPlaceholder")}
              submitLabel={t("subscribe")}
            />
            <p className="text-12">{t("noSpam")}</p>
          </div>
        </div>

        <div className="border-brand-soft flex flex-col gap-6 border-t pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-14">{t("weAccept")}</span>
            {PAYMENT_MARKS.map((mark) => (
              <span
                key={mark}
                className="bg-surface border-brand-soft rounded-4 text-12 border px-2 py-1"
              >
                {mark}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-14">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
            <div className="text-14 flex items-center gap-4">
              <Link href={href("privacy")} className="hover:underline">
                {t("privacy")}
              </Link>
              <Link href={href("terms")} className="hover:underline">
                {t("terms")}
              </Link>
              <LocaleSwitcher />
              <span>{t("currencyEuro")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
