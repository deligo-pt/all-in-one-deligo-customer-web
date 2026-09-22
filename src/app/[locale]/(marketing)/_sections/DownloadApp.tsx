import Image from "next/image";
import { getTranslations } from "@/i18n/server";

/**
 * The store badges, on the pale pink field. 1438×782.
 *
 * The badges are assembled the way the design assembles them: the Apple and
 * Google marks exported from the file, set in a dark lozenge with the two-line
 * lettering. Worth knowing before launch: Apple and Google both require their
 * *official* badge artwork rather than a reconstruction, so these are correct
 * to the design and still need replacing with the supplied assets.
 *
 * Neither links anywhere. There are no store listings yet, and a badge that
 * goes nowhere is worse than one that is visibly not ready.
 */
export async function DownloadApp() {
  const t = await getTranslations("home");

  const badges = [
    {
      lead: t("downloadAppStoreLead"),
      name: t("downloadAppStore"),
      mark: "/images/apple.webp",
    },
    {
      lead: t("downloadGooglePlayLead"),
      name: t("downloadGooglePlay"),
      mark: "/images/google-play.webp",
    },
  ];

  return (
    <section className="bg-brand-tint">
      <div className="max-w-narrow mx-auto grid w-full items-center gap-12 px-4 sm:px-8 py-12 sm:py-20 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h2 className="text-32 text-ink tracking-tight lg:text-48 font-semibold">
            {t("downloadTitle")}
          </h2>
          <p className="text-20 text-ink-muted leading-relaxed">{t("downloadBody")}</p>
          <ul className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <li key={badge.name}>
                <span className="bg-ink-strong text-ink-inverse rounded-8 flex items-center gap-3 px-5 py-2">
                  <Image src={badge.mark} alt="" aria-hidden width={24} height={24} />
                  <span className="flex flex-col">
                    <span className="text-10">{badge.lead}</span>
                    <span className="text-14 font-semibold">{badge.name}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Two phone mockups, overlapping, as the design lays them out. */}
        {/* The mock phones are illustration: on a phone they were ~450px of
            blank shapes under the store badges. Shown from `sm`. */}
        <div className="relative mx-auto hidden h-[30rem] w-full max-w-md items-end justify-center sm:flex">
          <Image
            src="/images/app-home.webp"
            alt=""
            aria-hidden
            width={322}
            height={639}
            className="rounded-24 absolute bottom-8 start-4 w-40 shadow-lg"
          />
          <Image
            src="/images/app-food.webp"
            alt={t("downloadImageAlt")}
            width={488}
            height={968}
            sizes="(min-width: 1024px) 16rem, 40vw"
            className="rounded-24 relative w-56 shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
