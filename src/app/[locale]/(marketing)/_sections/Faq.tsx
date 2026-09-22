import { SectionHeading } from "@/components/shared/SectionHeading";
import { getTranslations } from "@/i18n/server";
import { FaqAccordion } from "./FaqAccordion";
import type { MessageKey } from "@/i18n/namespaces";

/**
 * "Common Questions". 1435×757.
 *
 * The design lists six entries, two of which are the same question with the
 * same answer — a duplicated frame, not two questions. Five are kept.
 */
const ENTRIES = [
  { question: "faqHowQ", answer: "faqHowA" },
  { question: "faqCitiesQ", answer: "faqCitiesA" },
  { question: "faqPlusQ", answer: "faqPlusA" },
  { question: "faqTrackQ", answer: "faqTrackA" },
  { question: "faqPaymentQ", answer: "faqPaymentA" },
] as const satisfies ReadonlyArray<{
  question: MessageKey<"home">;
  answer: MessageKey<"home">;
}>;

export async function Faq() {
  const t = await getTranslations("home");

  return (
    <section className="max-w-narrow mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
      <SectionHeading
        eyebrow={t("faqEyebrow")}
        title={t("faqTitle")}
        align="center"
        className="mb-12"
      />
      <div className="mx-auto max-w-3xl">
        <FaqAccordion
          items={ENTRIES.map((entry) => ({
            question: t(entry.question),
            answer: t(entry.answer),
          }))}
        />
      </div>
    </section>
  );
}
