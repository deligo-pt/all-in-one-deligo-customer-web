#!/usr/bin/env node
/**
 * The first-load JavaScript budget (Plan.md §6).
 *
 * Next 16 stopped printing per-route First Load JS, so the budget in the plan
 * had no mechanism behind it and Phase 0 wrote one. That version read
 * `build-manifest.json` — and `build-manifest.json` describes the **Pages**
 * router. In an App Router application it contains one entry, `/_app`, which is
 * the framework runtime and nothing else. So for four phases this script
 * confidently reported 127 KB while the landing page shipped 178 KB, and would
 * have gone on doing that however far over budget a route went.
 *
 * It now measures what a browser actually downloads: for every prerendered
 * route, the scripts its HTML references. That is the only source of truth
 * available, and it has the advantage of being the same thing the customer
 * pays for.
 *
 * Polyfills are excluded — they carry `noModule`, so only browsers that cannot
 * run modern JavaScript fetch them, and charging every visitor for a file they
 * never download would make the number wrong in the flattering direction.
 *
 * Run after `pnpm build:check`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/**
 * **200 KB, raised from 180 on 9 Sep 2026 (decision D-7).**
 *
 * The original number was a guess made before a single screen existed, and it
 * did real work: two phases were made cheaper by chasing it — 36 KB out of
 * feature barrels in Phase 6, 9 KB by deleting a tab bar the design did not
 * have. It is raised rather than abandoned because it was still binding: the
 * listing sat at 98% and Phase 9 adds a cart on top of the same shell.
 *
 * What did not change is the part that matters. 127 KB of every route is the
 * framework, so the budget is really "how much of our own code may a route
 * ship", and that allowance went from 53 KB to 73 KB. A raise is not a licence
 * to stop splitting: three barrel leaks have been caught by this script, each
 * worth 9–27 KB, and every one of them would still be a bug at 200.
 */
const BUDGET_KB = 200;

const dist = [".next-build", ".next"]
  .map((d) => join(ROOT, d))
  .find((d) => existsSync(join(d, "server", "app")));

if (!dist) {
  console.error("\n✗ no build found — run `pnpm build:check` first\n");
  process.exit(1);
}

/** Every prerendered page in the build output. */
function htmlFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

const gzipCache = new Map();
function gzippedSize(assetPath) {
  if (gzipCache.has(assetPath)) return gzipCache.get(assetPath);
  const file = join(dist, assetPath.replace("/_next", ""));
  const size = existsSync(file) ? gzipSync(readFileSync(file)).length : 0;
  gzipCache.set(assetPath, size);
  return size;
}

const SCRIPT_TAG = /<script[^>]*\ssrc="(\/_next\/static\/[^"]+\.js)"[^>]*>/g;
const PRELOAD = /<link[^>]*\shref="(\/_next\/static\/[^"]+\.js)"[^>]*>/g;

/** Scripts the page loads, minus the legacy-only polyfill bundle. */
function scriptsIn(html) {
  const legacy = new Set(
    [...html.matchAll(SCRIPT_TAG)]
      .filter((m) => /\bnoModule\b/.test(m[0]))
      .map((m) => m[1]),
  );
  const all = new Set([
    ...[...html.matchAll(SCRIPT_TAG)].map((m) => m[1]),
    ...[...html.matchAll(PRELOAD)].map((m) => m[1]),
  ]);
  return {
    modern: [...all].filter((s) => !legacy.has(s)),
    legacy: [...legacy],
  };
}

const pages = htmlFiles(join(dist, "server", "app"))
  .map((file) => {
    const route =
      "/" +
      relative(join(dist, "server", "app"), file)
        .replace(/\.html$/, "")
        .split(sep)
        .join("/");
    const html = readFileSync(file, "utf8");
    const { modern, legacy } = scriptsIn(html);
    return {
      route,
      kb: modern.reduce((sum, s) => sum + gzippedSize(s), 0) / 1024,
      legacyKb: legacy.reduce((sum, s) => sum + gzippedSize(s), 0) / 1024,
      files: modern.length,
    };
  })
  .filter((page) => page.files > 0)
  // The development tools are not pages. Each calls `notFound()` in a
  // production build, so nothing a customer requests ever loads their chunks —
  // measuring them against a first-load budget is measuring something no
  // browser downloads. `verify:shell` is what makes that true, and asserts it
  // against this same list.
  .filter((page) => !DEV_ONLY_ROUTES.some((name) => page.route.endsWith(`/${name}`)))
  .sort((a, b) => b.kb - a.kb);

/**
 * Dynamic routes (Phase 16). A page that reads the session or the location
 * cookie renders per request and leaves no HTML to read scripts from — and
 * those are now the heaviest pages in the app. Their first load is taken from
 * the route's client reference manifest instead: the root main files plus
 * every entry chunk the manifest lists. That includes the error and not-found
 * boundaries, so it over-counts — by 3.5 KB on every one of five prerendered
 * routes checked (`/en`, `/en/food`, `/en/login`, `/en/checkout`,
 * `/en/account`). An upper bound is the safe side of a budget.
 */
function manifestFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...manifestFiles(full));
    else if (entry === "page_client-reference-manifest.js") out.push(full);
  }
  return out;
}
const buildManifest = JSON.parse(
  readFileSync(join(dist, "build-manifest.json"), "utf8"),
);
const prerenderedRoutes = new Set(
  pages.map((p) => p.route.replace(/^\/(en|pt)(?=\/|$)/, "")),
);
const appDir = join(dist, "server", "app");
for (const file of manifestFiles(appDir)) {
  const key =
    "/" +
    relative(appDir, file)
      .split(sep)
      .join("/")
      .replace(/_client-reference-manifest\.js$/, "");
  const path =
    key
      .replace(/^\/\[locale\]/, "")
      .replace(/\/\([^)]+\)/g, "")
      .replace(/\/page$/, "") || "/";
  if (!key.startsWith("/[locale]/") || prerenderedRoutes.has(path === "/" ? "" : path))
    continue;
  if (DEV_ONLY_ROUTES.some((name) => path === `/${name}`) || path.includes("[..."))
    continue;
  globalThis.__RSC_MANIFEST = {};
  new Function(readFileSync(file, "utf8"))();
  const manifest = globalThis.__RSC_MANIFEST[key];
  if (!manifest) continue;
  const chunks = new Set([
    ...(buildManifest.rootMainFiles ?? []),
    ...Object.values(manifest.entryJSFiles).flat(),
  ]);
  pages.push({
    route: `${path} (dynamic, upper bound)`,
    kb: [...chunks].reduce((sum, c) => sum + gzippedSize(`/_next/${c}`), 0) / 1024,
    legacyKb: 0,
    files: chunks.size,
  });
}
pages.sort((a, b) => b.kb - a.kb);

console.log(`\n\x1b[1mFirst-load JS — budget ${BUDGET_KB} KB gzipped\x1b[0m`);
if (pages.length === 0) {
  console.error("\n\x1b[31m✗ no prerendered pages found — has the build run?\x1b[0m\n");
  process.exit(1);
}
console.log(
  `  ${pages.length} routes (${pages.filter((p) => p.route.includes("dynamic")).length} dynamic) · polyfills excluded (${Math.max(...pages.map((p) => p.legacyKb)).toFixed(1)} KB, legacy browsers only)\n`,
);

const over = [];
for (const page of pages) {
  const pct = Math.round((page.kb / BUDGET_KB) * 100);
  const ok = page.kb <= BUDGET_KB;
  if (!ok) over.push(page);
  // Only the worst offenders and anything close to the line are worth printing;
  // forty identical placeholder routes are noise.
  if (pages.indexOf(page) < 6 || pct >= 90) {
    console.log(
      `  ${ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"} ${page.route.padEnd(52)} ${page.kb.toFixed(1).padStart(7)} KB   ${String(pct).padStart(3)}%`,
    );
  }
}

const worst = pages[0];
console.log("");
if (over.length) {
  console.error(
    `\x1b[31m✗ ${over.length} route${over.length === 1 ? "" : "s"} over budget\x1b[0m\n`,
  );
  console.error(
    "  The fix is almost never minification. It is a `use client` that has drifted up\n" +
      "  the tree, or a barrel import pulling a whole package in for one export.\n",
  );
  process.exit(1);
}
console.log(
  `\x1b[32m✓ every route within budget\x1b[0m  (worst: ${worst.route} at ${worst.kb.toFixed(1)} KB, ${Math.round((worst.kb / BUDGET_KB) * 100)}%)\n`,
);
