import { SectionHeading } from "@/components/shared/SectionHeading";
import { getLocale, getTranslations } from "@/i18n/server";
import { formatDate, formatRegion } from "@/lib/i18n/format";
import { TESTIMONIALS } from "./testimonial-data";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

/**
 * "Loved by Millions" — the testimonial row.
 *
 * Everything localisable is resolved here, on the server: the country from its
 * ISO code, the date from its ISO string. The client component below receives
 * finished strings, so the carousel ships no formatting code and no dictionary.
 */
export async function Testimonials() {
  const [t, locale] = await Promise.all([getTranslations("home"), getLocale()]);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0] ?? "")
      .slice(0, 2)
      .join("");

  const items = TESTIMONIALS.map((item) => ({
    name: item.name,
    initials: initials(item.name),
    quote: item.quote,
    region: formatRegion(item.region, locale),
    date: formatDate(item.date, locale, { month: "long", year: "numeric" }),
    verified: t("reviewsVerified"),
  }));

  return (
    <section className="max-w-narrow mx-auto w-full px-8 py-20">
      <SectionHeading
        eyebrow={t("reviewsEyebrow")}
        title={t("reviewsTitle")}
        align="center"
        className="mb-12"
      />
      <TestimonialsCarousel
        items={items}
        label={t("reviewsRegion")}
        previousLabel={t("reviewsPrevious")}
        nextLabel={t("reviewsNext")}
      />
    </section>
  );
}
