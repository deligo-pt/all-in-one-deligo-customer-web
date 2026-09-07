import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

// Run `pnpm analyze` to open the interactive bundle report. Plan.md §6 sets a
// hard budget (180 KB gzipped first-load JS per route); this is how it gets
// checked rather than assumed.
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Security headers applied to every response.
//
// Content-Security-Policy is deliberately absent. A wrong CSP does not degrade
// the page, it white-screens it, and this app will load Google Maps, Firebase
// Cloud Messaging, the payment redirect and two social-login SDKs — each of
// which needs its own allowlist entries across script-src, connect-src and
// frame-src. It goes in at Phase 24, report-only first, against a running app.
// Guessing at it now would mean shipping a policy nobody has tested.
const securityHeaders = [
  // Force HTTPS for two years, including subdomains (ignored on http/localhost).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Don't let browsers MIME-sniff responses into a different content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow framing by other origins (clickjacking protection).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Origin only on cross-origin navigations; full URL same-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Least privilege: geolocation is needed for address entry; camera and
  // microphone never are.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  // The dev server owns `.next/`. `pnpm build:check` sets NEXT_DIST_DIR so a
  // verification build writes somewhere else and the two never contend. Unset
  // in normal use, so `next build` and `next dev` behave exactly as expected.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Strip console.* from production (keep console.error) to shrink client JS.
  // Deferred from Phase 0 until there were packages to optimise. `radix-ui` is a
  // single package re-exporting ~30 primitives; without this, importing
  // `{ Dialog }` from it pulls the whole surface into the module graph and the
  // bundler has to prove the rest unused. `sonner` is listed for the same reason.
  experimental: {
    optimizePackageImports: ["radix-ui", "sonner"],
  },

  compiler: {
    removeConsole: { exclude: ["error"] },
  },
  // Don't ship browser source maps or advertise the framework in production.
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // AVIF/WebP with automatic fallback — markedly smaller than JPEG/PNG at the
    // same visual quality, which matters most on the image-heavy vendor grids.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for a week. Keyed by URL, so a changed source image
    // gets a new entry — there is no stale-asset risk in raising this.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // `remotePatterns` is deliberately empty until Phase 16, when the real image
    // hosts are known. A host missing from this list fails the image at render
    // time, so the list must be derived from the backend's responses, not guessed.
    remotePatterns: [],
  },
};

export default bundleAnalyzer(nextConfig);
