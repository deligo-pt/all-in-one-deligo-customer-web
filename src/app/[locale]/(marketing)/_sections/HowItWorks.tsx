import { SectionHeading } from "@/components/shared/SectionHeading";
import { getTranslations } from "@/i18n/server";

/**
 * Four steps on the pale pink field. 1440×601.
 *
 * The design numbers them 01 · 02 · 02 · 05. That is a copy-paste slip, not a
 * decision, and it is corrected here to 01–04 — the numbers are generated from
 * the order rather than typed, so the same slip cannot come back.
 */
const STEPS = [
  { title: "howDiscoverTitle", body: "howDiscoverBody" },
  { title: "howOrderTitle", body: "howOrderBody" },
  { title: "howTrackTitle", body: "howTrackBody" },
  { title: "howEnjoyTitle", body: "howEnjoyBody" },
] as const;

export async function HowItWorks() {
  const t = await getTranslations("home");

  return (
    <section className="bg-brand-tint">
      <div className="max-w-narrow mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
        <SectionHeading
          eyebrow={t("howEyebrow")}
          title={t("howTitle")}
          align="center"
        />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span className="text-12 text-brand font-semibold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-16 text-ink font-semibold">{t(step.title)}</h3>
              <p className="text-14 text-ink-muted leading-relaxed">{t(step.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
