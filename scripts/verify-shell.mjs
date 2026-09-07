#!/usr/bin/env node
/**
 * Phase 4 guard — the route map and the shell around it.
 *
 * The header and the footer link to most of the application. A link whose
 * target does not exist is a 404 that nobody finds until a customer does, and
 * it is invisible in review because the link itself looks fine. So the route
 * map is a declaration in `src/lib/routes.ts` and this file checks it against
 * the filesystem in both directions: every route has a page, and every page is
 * a route.
 *
 * The rest of the file is about the shell's own promises — that the boundaries
 * exist, that the flagged verticals are actually filtered, that the skip link
 * has something to skip to, and that paths are never written by hand.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const APP = join(SRC, "app", "[locale]");

let passed = 0;
const failures = [];
const check = (name, ok, detail = "") => {
  if (ok) passed += 1;
  else failures.push(detail ? `${name}\n      ${detail}` : name);
};
const section = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);
const rel = (f) => relative(ROOT, f);

function filesUnder(dir, exts = [".ts", ".tsx"]) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e.startsWith(".next")) continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...filesUnder(full, exts));
    else if (exts.some((x) => e.endsWith(x))) out.push(full);
  }
  return out;
}

/** Source with comments removed, so a rule about code is not satisfied — or
 *  broken — by prose. The doc comment above `AppShell` quotes `<main id="main">`;
 *  without this, deleting the real one would still pass. Same character-walking
 *  stripper as the other guards, kept identical on purpose. */
function stripComments(src) {
  let out = "";
  let i = 0;
  const REGEX_ALLOWED_BEFORE = /[(,=:[!&|?;+\-*%^~>]$/;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      out += c;
      i += 1;
      while (i < src.length && src[i] !== c) {
        if (src[i] === "\\") {
          out += src[i] + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      out += c;
      i += 1;
      continue;
    }
    if (c === "/" && REGEX_ALLOWED_BEFORE.test(out.trimEnd())) {
      out += c;
      i += 1;
      while (i < src.length && src[i] !== "/") {
        if (src[i] === "\\") {
          out += src[i] + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      out += src[i] ?? "";
      i += 1;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

const read = (f) => stripComments(readFileSync(f, "utf8"));

const { ROUTES } = await import(pathToFileURL(join(SRC, "lib", "routes.ts")).href);

/** Where a route's page must live: the group folder, then the path. */
const pageFor = (route) =>
  join(
    APP,
    `(${route.group})`,
    ...(route.path === "/" ? [] : route.path.slice(1).split("/")),
    "page.tsx",
  );

/** Routes are the customer-facing tree. These three are development tools that
 *  prerender as 404s, and they are deliberately outside it. */
const DEV_ONLY = ["tokens", "primitives", "formats"];

// ─────────────────────────────────────────────────────────────────────────────
section("§1  Every route resolves, and every page is a route");

const missingPages = Object.entries(ROUTES).filter(([, r]) => !existsSync(pageFor(r)));
check(
  `every route in the map has a page (${Object.keys(ROUTES).length})`,
  missingPages.length === 0,
  `The header and footer link to these. A missing page is a 404 that only a customer finds.\n      ${missingPages.map(([n, r]) => `${n} → ${rel(pageFor(r))}`).join("\n      ")}`,
);

const declaredPages = new Set(Object.values(ROUTES).map((r) => pageFor(r)));
const strayPages = filesUnder(APP, [".tsx"])
  .filter((f) => f.endsWith(`${sep}page.tsx`))
  .filter((f) => !declaredPages.has(f))
  .filter((f) => !DEV_ONLY.some((d) => f.includes(`${sep}${d}${sep}`)))
  // The catch-all exists to reject, not to serve.
  .filter((f) => !f.includes("[...rest]"));
check(
  "every page under [locale] is named in the route map",
  strayPages.length === 0,
  `A page nothing declares cannot be linked to from the shell, cannot be found by this guard, and will not be noticed when it rots.\n      ${strayPages.map(rel).join("\n      ")}`,
);

const badPhases = Object.entries(ROUTES).filter(
  ([, r]) => !Number.isInteger(r.phase) || r.phase < 1 || r.phase > 24,
);
check(
  "every route names the phase that builds it",
  badPhases.length === 0,
  `Without it there is no way to tell a page that is waiting from a page that was forgotten.\n      ${badPhases.map(([n]) => n).join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  The shell wraps every group");

const GROUPS = [...new Set(Object.values(ROUTES).map((r) => r.group))];
const groupsWithoutShell = GROUPS.filter((g) => {
  const layout = join(APP, `(${g})`, "layout.tsx");
  return !existsSync(layout) || !/<AppShell\b/.test(read(layout));
});
check(
  `every route group mounts the shell (${GROUPS.length})`,
  groupsWithoutShell.length === 0,
  `A group without a layout renders its pages with no header, no footer and no skip link — and looks fine in isolation.\n      ${groupsWithoutShell.join(", ")}`,
);

const shellSource = read(join(SRC, "components", "layout", "AppShell.tsx"));
check(
  "the shell provides the landmark the skip link targets",
  /<main id="main"/.test(shellSource),
  "The header's first tab stop is a link to `#main`. Without the target it moves focus nowhere, which is worse than not having it — a keyboard user presses it and then tabs through the whole header anyway.",
);

const headerSource = read(join(SRC, "components", "layout", "SiteHeader.tsx"));
check(
  "the skip link is the first thing in the header",
  /href="#main"/.test(headerSource),
  "Six vertical links, a search field and four buttons stand between the top of the page and its content on every navigation.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  Paths are declared, never typed");

const layoutFiles = filesUnder(join(SRC, "components", "layout"), [".tsx"]);
const handWritten = [];
for (const f of layoutFiles) {
  const code = read(f);
  for (const m of code.matchAll(/href=\{?["'](\/[^"'{}]*)["']/g)) {
    // `#main` is a fragment, not a route.
    if (m[1].startsWith("/#")) continue;
    handWritten.push(`${rel(f)}  href="${m[1]}"`);
  }
}
check(
  `no shell component writes a path by hand (${layoutFiles.length} files)`,
  handWritten.length === 0,
  `Every link goes through \`ROUTES\` and \`withLocale\`. A typed path loses the locale prefix, and a typed path that is right today is the one that is missed when a route moves.\n      ${handWritten.join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The flagged verticals (D-6)");

const flagged = Object.entries(ROUTES).filter(([, r]) => r.flagged);
check(
  `some routes are flagged as having no backend (${flagged.map(([n]) => n).join(", ") || "none"})`,
  flagged.length > 0,
  "Plan.md §2.3 lists the verticals the design describes and the API does not answer for. If none are marked, either the flag or the list has been lost.",
);

const footerSource = read(join(SRC, "components", "layout", "SiteFooter.tsx"));
for (const [file, source] of [
  ["SiteHeader.tsx", headerSource],
  ["SiteFooter.tsx", footerSource],
]) {
  check(
    `${file} hides the flagged verticals`,
    /unbuiltVerticalsVisible\(\)/.test(source) && /flagged/.test(source),
    `Both link to the six verticals. A vertical that is hidden in one and shown in the other is still one click from a page that cannot answer.`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section("§5  Boundaries");

for (const [file, why] of [
  [
    join(APP, "error.tsx"),
    "a render that throws would fall through to Next's own error page, in English",
  ],
  [join(APP, "loading.tsx"), "a slow route would show a blank screen"],
  [
    join(APP, "not-found.tsx"),
    "an unknown path under a locale would leave the language tree",
  ],
  [
    join(APP, "[...rest]", "page.tsx"),
    "nothing would reach `not-found.tsx`, because Next only uses it when something inside the segment calls `notFound()`",
  ],
  [
    join(SRC, "app", "global-error.tsx"),
    "a failure in the root layout itself has nowhere to render",
  ],
]) {
  check(`${rel(file)} exists`, existsSync(file), `Without it, ${why}.`);
}

const devOnlyMissingGuard = DEV_ONLY.filter((name) => {
  const page = join(APP, name, "page.tsx");
  return (
    existsSync(page) && !/NODE_ENV === "production"/.test(readFileSync(page, "utf8"))
  );
});
check(
  `every development-only page 404s in production (${DEV_ONLY.join(", ")})`,
  devOnlyMissingGuard.length === 0,
  `These are tools. Shipping one is a page a customer can find that shows them the inside of the design system.\n      ${devOnlyMissingGuard.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  Pages (Track B: static, no network)");

const pageFiles = filesUnder(join(SRC, "app"), [".tsx"]);

const rawImages = [
  ...pageFiles,
  ...filesUnder(join(SRC, "components"), [".tsx"]),
].filter((f) => /<img\b/.test(read(f)));
check(
  "no page or component uses a raw <img>",
  rawImages.length === 0,
  `\`next/image\` is what makes the AVIF/WebP conversion, the lazy loading and the layout reservation in next.config.ts apply. A raw \`<img>\` opts out of all three silently, and the page still looks right on the machine it was written on.\n      ${rawImages.map(rel).join("\n      ")}`,
);

const priorityImages = pageFiles.filter((f) => /\bpriority\b/.test(read(f)));
check(
  `only the hero image is priority (${priorityImages.map((f) => rel(f).split(sep).pop()).join(", ") || "none"})`,
  priorityImages.length <= 1,
  `\`priority\` disables lazy loading and preloads. Two of them is two images competing to be the Largest Contentful Paint, and the loser slows the winner down.\n      ${priorityImages.map(rel).join("\n      ")}`,
);

const marketingFiles = filesUnder(join(APP, "(marketing)"), [".ts", ".tsx"]);
const fetchers = marketingFiles.filter((f) => /\bfetch\s*\(/.test(read(f)));
check(
  `the marketing pages make no network calls (${marketingFiles.length} files)`,
  fetchers.length === 0,
  `Track B is deliberately static — the design is built and proven before any of it is wired to an API, so that a layout bug and a data bug can never be the same bug. The API arrives in Track C.\n      ${fetchers.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§7  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:shell"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} shell assertions passed\x1b[0m\n`);
