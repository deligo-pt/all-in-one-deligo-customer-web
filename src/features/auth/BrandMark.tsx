import Image from "next/image";
import type { SocialProvider } from "./types";

const SOURCES: Record<SocialProvider, string> = {
  GOOGLE: "/brand/google.svg",
  FACEBOOK: "/brand/facebook.svg",
};

/**
 * A provider's own mark, served as-is.
 *
 * These are the only two images in the application that are not ours, and they
 * are the only two that must not be recoloured — Google and Facebook both
 * mandate exact artwork, and Facebook checks during App Review. That is also
 * why they sit in `public/brand/` rather than in the icon registry: every icon
 * in `src/lib/icons.ts` is drawn in `currentColor` so a role can tint it, and
 * `verify:design` forbids a colour literal anywhere under `src/`. Keeping a
 * third party's mandated hex out of the token system is the honest reading of
 * that rule rather than an exception to it. See `public/brand/README.md`.
 *
 * `unoptimized` because the optimiser does not process SVG, and at ~700 bytes
 * there is nothing to gain. `next/image` still reserves the space.
 */
export function BrandMark({
  provider,
  className,
}: {
  provider: SocialProvider;
  className?: string;
}) {
  return (
    <Image
      src={SOURCES[provider]}
      alt=""
      aria-hidden
      width={20}
      height={20}
      unoptimized
      className={className}
    />
  );
}
