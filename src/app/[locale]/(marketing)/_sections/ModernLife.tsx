import { ImageSlot } from "@/components/shared/ImageSlot";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getTranslations } from "@/i18n/server";

/**
 * "Designed for your modern life" — three numbered points beside an image, then
 * a founder's quote.
 *
 * The big `01` `02` `03` are decoration in `brand-soft` at 48/400. They are
 * `aria-hidden`: the list is already a list, and hearing "zero one" before each
 * item adds nothing that the order does not already say.
 */
const POINTS = [
  { title: "aboutOneTitle", body: "aboutOneBody" },
  { title: "aboutTwoTitle", body: "aboutTwoBody" },
  { title: "aboutThreeTitle", body: "aboutThreeBody" },
] as const;

export async function ModernLife() {
  const t = await getTranslations("home");

  return (
    <section className="max-w-narrow mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
      <SectionHeading eyebrow={t("aboutEyebrow")} title={t("aboutTitle")} />

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
        <ol className="flex flex-col gap-10">
          {POINTS.map((point, index) => (
            <li key={point.title} className="flex items-start gap-6">
              <span aria-hidden className="text-48 text-brand-soft leading-tight">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-24 text-ink font-semibold">{t(point.title)}</h3>
                <p className="text-16 text-ink-muted leading-relaxed">
                  {t(point.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <ImageSlot
          src="/images/about.webp"
          alt={t("aboutTitle")}
          sizes="(min-width: 1024px) 34rem, 100vw"
          className="rounded-24 aspect-4/3 w-full"
        />
      </div>

      <figure className="border-line-subtle mt-12 flex flex-col gap-4 border-t pt-10">
        <blockquote className="text-16 text-ink leading-relaxed font-medium">
          {t("aboutQuote")}
        </blockquote>
        <figcaption className="flex flex-col">
          <span className="text-16 text-ink font-semibold">{t("aboutQuoteName")}</span>
          <span className="text-14 text-ink">{t("aboutQuoteRole")}</span>
        </figcaption>
      </figure>
    </section>
  );
}
