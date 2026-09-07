import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";

/**
 * The wordmark, measured: a 31px round mark beside "DeliGo" at 20/600 in brand
 * pink, 8px apart.
 *
 * The mark is the real one, exported from the Figma node as SVG. An earlier
 * version of this file drew a placeholder circle with a letter in it, on the
 * mistaken grounds that the logo had "no exportable asset" — the layer has no
 * export *setting*, which is not the same thing as not being exportable. The
 * images API renders any node on demand.
 */
export function Logo({
  locale,
  label,
  className,
  size = "md",
}: {
  locale: Locale;
  /** The accessible name of the home link — the app's name. */
  label: string;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <Link
      href={withLocale("/", locale)}
      aria-label={label}
      className={cn("flex shrink-0 items-center gap-2", className)}
    >
      <Image
        src="/logo.svg"
        alt=""
        aria-hidden
        width={32}
        height={32}
        className={cn("shrink-0", size === "lg" ? "size-10" : "size-8")}
        // Eager, not `priority`. The mark is above the fold on every page so it
        // must not be lazy-loaded, but at 4 KB it is never the Largest
        // Contentful Paint and has no business competing with the hero for a
        // preload slot.
        loading="eager"
      />
      <span
        aria-hidden
        className={cn(
          "text-brand font-semibold",
          size === "lg" ? "text-32" : "text-20",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
