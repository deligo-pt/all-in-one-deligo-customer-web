#!/usr/bin/env node
/**
 * Phase 7 guard — the food vertical.
 *
 * This is the first phase whose screens are made of **data**, and that changes
 * what can go wrong. The landing page could be checked by reading it; a
 * restaurant listing cannot, because the thing most likely to be wrong is
 * invisible: a price the frontend formatted, a rating it rounded, a sample
 * menu that survives into production because it looks exactly like a real one.
 *
 * So the rules here are about the seam. One catalogue contract. No number
 * derived from another number. The design's sample content reachable from
 * exactly one page, and that page a 404 in production.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FEATURE = join(SRC, "features", "food");
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

/** Same character-walking stripper as the other five guards, kept identical on
 *  purpose: a rule about code must not be satisfied — or broken — by prose. */
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
const featureFiles = filesUnder(FEATURE);
const code = new Map(
  filesUnder(SRC).map((f) => [f, stripComments(readFileSync(f, "utf8"))]),
);

const types = read(join(FEATURE, "types.ts"));
const catalog = read(join(FEATURE, "catalog.ts"));
const listing = read(join(FEATURE, "VendorListing.tsx"));
const menu = read(join(FEATURE, "VendorMenu.tsx"));
const itemCard = read(join(FEATURE, "MenuItemCard.tsx"));
const vendorCard = read(join(FEATURE, "VendorCard.tsx"));
const fixturePath = join(APP, "food-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  Money and ratings are the backend's, verbatim");

check(
  "the catalogue types money as text, not as a number",
  /price: string/.test(types) && !/price: number/.test(types),
  "A `number` invites a `toFixed(2)`, then a rounding rule, then a currency symbol chosen here. Plan.md §2.2 carries one rule from the old app: discount, rating and money values are displayed exactly as returned. A type that cannot hold a float cannot quietly re-derive one.",
);

check(
  "ratings are text too",
  /rating\?: string/.test(types) && !/rating\??: number/.test(types),
  "`4.8` is what the API sends and what the customer must read. Averaging, rounding or re-deriving it here produces a number the vendor never agreed to.",
);

/**
 * Two separate rules, because they fail differently.
 *
 * **Numeric conversion is banned outright.** `toFixed`, `parseFloat` and
 * `Number(` have no honest use in this feature — every money and rating value
 * arrives as text and leaves as text — so they are flagged wherever they
 * appear, with no money word required nearby. That matters: the first version
 * needed both on one line, and `{(1.0).toFixed(2)}` replacing `{vendor.rating}`
 * removed the word and walked straight through.
 *
 * **Arithmetic needs a money word on the same line**, and a *spaced* operator.
 * Unspaced `-` and `/` are everywhere here and mean nothing arithmetic —
 * `size-4`, `text-rating`, `</p>` — and an earlier version reported all three
 * as sums on a price.
 */
const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|rating|total|discount|amount)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const arithmeticLines = (src) =>
  src
    .split("\n")
    .filter(
      (line) => CONVERSION.test(line) || (MONEY_WORD.test(line) && OPERATOR.test(line)),
    );

const calculators = featureFiles.filter(
  (f) => arithmeticLines(code.get(f) ?? "").length > 0,
);
check(
  `nothing in the feature converts or computes a money value (${featureFiles.length} files)`,
  calculators.length === 0,
  `The backend computes money. Every sum, discount and VAT line the customer sees is one it has already decided, and a second opinion computed here is how a cart and a checkout end up disagreeing.\n      ${calculators.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  Nothing is wired, and no catalogue is invented");

const NETWORK = /\bfetch\s*\(|\baxios\b|XMLHttpRequest/;
const callers = featureFiles.filter((f) => NETWORK.test(code.get(f) ?? ""));
check(
  "no file in the feature makes a network call",
  callers.length === 0,
  `Track B builds the screens and Phase 16 connects them. A request placed here now is one the API layer will not know about — no interceptor, no token refresh, no error normalisation.\n      ${callers.map(rel).join("\n      ")}`,
);

const METHODS = ["listVendors", "listCuisines", "getVendor", "getProduct"];
const missing = METHODS.filter((m) => !new RegExp(`\\b${m}\\b`).test(types));
check(
  `the catalogue contract names every read the screens need (${METHODS.join(", ")})`,
  missing.length === 0,
  `A contract missing one of these is a screen Phase 16 has to redesign around.\n      ${missing.join(", ")}`,
);

const rejects = (catalog.match(/Promise\.reject\(/g) ?? []).length;
check(
  `every method of the shipped catalogue fails (${rejects}/${METHODS.length} reject)`,
  rejects >= METHODS.length,
  "A stub that resolves with sample restaurants is the worst possible bug in this project: it survives review precisely because it looks right, and it ships prices nobody set.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The design's sample content cannot reach a customer");

check(
  "the fixture exists and lives beside the development page",
  existsSync(fixturePath),
  `Expected ${rel(fixturePath)} — sample content in its own file is what makes "does anything else import this?" a question with a mechanical answer.`,
);

const fixtureImporters = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([, s]) => /from "(?:\.\/|\.\.\/)*fixture"|food-states\/fixture/.test(s))
  .map(([f]) => rel(f));
const allowed = fixtureImporters.filter(
  (f) => !f.includes(`food-states${sep}page.tsx`),
);
check(
  `only the development states page imports the fixture (${fixtureImporters.length} importer${fixtureImporters.length === 1 ? "" : "s"})`,
  allowed.length === 0,
  `"The Burger Lab" and "9.90€" are a picture of the design, not data. One import from a shipping page is how a picture becomes a product.\n      ${allowed.join("\n      ")}`,
);

check(
  "the states page is on the development-only list",
  DEV_ONLY_ROUTES.includes("food-states"),
  "`verify:shell` asserts everything on that list 404s in production, and `verify:bundle` excludes it from the budget on the strength of that. A page holding sample restaurants that is *not* on the list is a page a customer can open.",
);

check(
  "the dish modal is not a value export of the barrel",
  !/export \{[^}]*\bProductModal\b/.test(read(join(FEATURE, "index.ts"))),
  "It is reached through `VendorMenu`'s `dynamic()` call, and only the vendor page opens it. Exported as a value it becomes a client reference of every static importer of the barrel — measured at 11 KB on `/food/restaurants`, a route with no dish modal on it. The type is exported instead; a type is erased. Third occurrence of this in two phases.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The screens say which nothing they are showing");

// Counted, not merely present. The listing has two — "nothing matched" and
// "not connected" — and losing one of them leaves the other answering for
// both, which is the exact confusion the next rule is about.
for (const [name, source, atLeast] of [
  ["the listing", listing, 2],
  ["the vendor page", menu, 1],
]) {
  const rendered = (source.match(/<EmptyState\b/g) ?? []).length;
  check(
    `${name} renders its empty states (${rendered}/${atLeast})`,
    rendered >= atLeast,
    "A grid that renders nothing and says nothing is indistinguishable from one that is still loading.",
  );
}

check(
  "the listing tells 'no matches' apart from 'not connected'",
  /unavailable \?/.test(listing) &&
    /vendors\.length === 0 \?/.test(listing) &&
    /copy\.emptyTitle/.test(listing) &&
    /copy\.unavailableTitle/.test(listing),
  "Different sentences, different fixes, and only one of them is the customer's to make. Collapsing them is how somebody clears filters that were never the problem.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The cards are honest about what they do not do yet");

check(
  "the add button carries the item's name",
  /addLabel\}\s*\$\{item\.name\}|\$\{addLabel\}\s*\$\{item\.name\}/.test(itemCard) ||
    /`\$\{addLabel\} \$\{item\.name\}`/.test(itemCard),
  "Twenty identical buttons named 'Add to cart' are twenty identical buttons to a screen reader. The dish's name is the only thing that tells them apart.",
);

const optionField = read(join(FEATURE, "OptionGroupField.tsx"));
const productModal = read(join(FEATURE, "ProductModal.tsx"));

check(
  "the option control is chosen by `maxSelectable`, not by a name",
  /maxSelectable <= 1/.test(optionField),
  "One choice is a radio group, several is checkboxes, and the only honest signal for which is the number the backend sends. Deciding it from the group's title — 'Choice of…' — is how a group becomes a radio here and a checkbox in the app.",
);

check(
  "a required group blocks the add before the request",
  /minSelectable/.test(productModal),
  "The backend rejects a line missing a mandatory group and names the group in an error the customer cannot act on. The old app learned to refuse first; this one starts there.",
);

check(
  "the vendor card links rather than handles a click",
  /<Link\b/.test(vendorCard) && !/onClick/.test(vendorCard),
  "A card that navigates is a link: it opens in a new tab on a middle click, it can be copied, and it is reachable by keyboard without anything being added. A div with an onClick is none of those.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:food"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} food assertions passed\x1b[0m\n`);
