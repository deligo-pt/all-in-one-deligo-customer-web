import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ImageSlot } from "@/components/shared/ImageSlot";
import { LocationForm, type LocationFormCopy } from "@/components/shared/LocationForm";

export type VerticalHeroCopy = {
  badge: string;
  titleLead: string;
  titleAccent: string;
  body: string;
  location: LocationFormCopy;
  cta: string;
  trustedBy: string;
};

/**
 * A vertical's front door — `Food` and `Groceries`, both 1440×823 and the same
 * frame with different words: a 37px pill, a 48/700 headline whose second line
 * is brand, a 20/400 paragraph, a 560×64 address bar, a 205×51 call to action.
 *
 * One component because the two frames are one layout; a second copy is where
 * the pinks start to drift. The address bar is `LocationForm` (Phase 16).
 */
export function VerticalHero({
  image,
  href,
  locale,
  copy,
}: {
  /** Absent renders the placeholder field — see D-12. */
  image?: string;
  href: string;
  locale: string;
  copy: VerticalHeroCopy;
}) {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-6.875rem)] items-center overflow-hidden">
      <ImageSlot
        src={image}
        alt={copy.body}
        priority
        sizes="100vw"
        className="absolute inset-0 -z-10 size-full"
      />

      <div className="max-w-narrow mx-auto w-full px-8 py-16">
        <div className="flex max-w-xl flex-col items-start gap-6">
          <span className="bg-brand-tint text-brand text-14 rounded-full px-4 py-2 font-medium">
            {copy.badge}
          </span>

          <h1 className="text-48 text-ink font-bold">
            {copy.titleLead}
            <br />
            <span className="text-brand">{copy.titleAccent}</span>
          </h1>

          <p className="text-20 text-ink-muted max-w-lg">{copy.body}</p>

          <LocationForm locale={locale} href={href} copy={copy.location} />

          <Button size="lg" className="rounded-8" asChild>
            <Link href={href}>
              {copy.cta}
              <Icon name="chevron-right" className="size-4" />
            </Link>
          </Button>

          <p className="text-12 text-brand font-semibold">{copy.trustedBy}</p>
        </div>
      </div>
    </section>
  );
}
