#!/usr/bin/env node
/**
 * Phase 20m guard — a page that waits must say so.
 *
 * Every screen here is a server component, so a click holds the *old* page on
 * screen until the API answers. Measured before this phase, on a production
 * build: **951ms of nothing**, then the new page in one jump. `loading.tsx` is
 * what Next paints the instant a navigation starts, and these rules keep one
 * next to every page that waits on the network — shaped like that page, server
 * rendered, and carrying no feature code into the route.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const APP = join(SRC, "app", "[locale]");
const SHOP = join(APP, "(shop)");

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

/** The same character-walking stripper as the other seven guards, kept
 *  identical on purpose: a rule about code must not be satisfied — or broken —
 *  by prose. Every module here documents the construct it removed. */
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

const read = (f) => (existsSync(f) ? stripComments(readFileSync(f, "utf8")) : "");

const KIT = join(SRC, "components", "shared", "skeletons.tsx");
const kit = read(KIT);

function pagesUnder(dir) {
  return filesUnder(dir).filter((f) => f.endsWith(`${sep}page.tsx`));
}

// A page that reads anything but the local content module goes over the
// network, so it is a page that waits.
const waits = pagesUnder(APP).filter((file) => {
  const rel = relative(SRC, file);
  if (DEV_ONLY_ROUTES.some((route) => rel.includes(route.replace(/^\//, ""))))
    return false;
  const src = read(file);
  const services = [...src.matchAll(/@\/services\/([a-z]+)/g)].map((m) => m[1]);
  return services.some((name) => name !== "content");
});

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a71  Every page that waits has a loading state");

check(
  "pages that read the API were found at all",
  waits.length >= 15,
  "If this list is empty the rest of the section proves nothing.",
);

const missing = waits
  .map((file) => join(dirname(file), "loading.tsx"))
  .filter((file) => !existsSync(file))
  .map((file) => rel(dirname(file)));

check(
  "each of them has its own loading.tsx",
  missing.length === 0,
  `Without one the router waits on the server and the customer looks at the page they just left. Missing: ${missing.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a72  The loading states cost nothing and say the right thing");

const loadings = filesUnder(APP).filter((f) => f.endsWith(`${sep}loading.tsx`));

check(
  "no loading state is a client component",
  loadings.every((file) => !/"use client"/.test(read(file))),
  "A placeholder that ships JavaScript delays the thing it is standing in for.",
);

check(
  "no loading state reaches into a feature",
  loadings.every((file) => !/@\/features\//.test(read(file))),
  "A feature barrel in a loading file puts the whole screen's code on the route before the screen exists.",
);

check(
  "the shapes come from the one kit",
  loadings
    .filter((file) => rel(file) !== rel(join(APP, "loading.tsx")))
    .every((file) => /@\/components\/shared\/skeletons/.test(read(file))),
  "Twelve hand-rolled grey boxes drift apart; the kit is what keeps a skeleton the shape of its page.",
);

check(
  "the kit marks the page busy and hides the boxes",
  /aria-busy="true"/.test(kit) &&
    /aria-hidden/.test(read(join(SRC, "components", "ui", "Skeleton.tsx"))),
  "A screen reader should be told the page is loading once, not read twelve rectangles.",
);

check(
  "the pulse is CSS, so reduced motion stops it",
  /animate-pulse/.test(read(join(SRC, "components", "ui", "Skeleton.tsx"))),
  "An animation driven from script would keep moving for a reader who asked it not to.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a73  The slowest screens are shaped, not generic");

check(
  "the vendor page's skeleton draws its hero, its rail and its cart column",
  /aspect-\[1312\/448\]/.test(read(join(SHOP, "vendors", "[vendorId]", "loading.tsx"))),
  "It is the slowest screen in the app — three calls — so it is the one where a wrong shape is on screen longest.",
);

check(
  "the listings open with the delivery card, as the real pages do",
  /<DeliveryBarSkeleton \/>/.test(
    read(join(SHOP, "food", "restaurants", "loading.tsx")),
  ) &&
    /<DeliveryBarSkeleton \/>/.test(
      read(join(SHOP, "groceries", "stores", "loading.tsx")),
    ),
  "The card is the first thing on both listings; a skeleton without it jumps when the page lands.",
);

check(
  "the account screens keep the frame and its rail",
  /AccountSkeleton/.test(
    read(join(APP, "(account)", "account", "orders", "loading.tsx")),
  ),
  "The menu stays where the customer left it; the skeleton should not pretend otherwise.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a74  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:loading"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m\u2717 ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m\u2713 ${passed}/${passed} loading assertions passed\x1b[0m\n`);
