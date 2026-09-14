#!/usr/bin/env node
/**
 * Phase 13 guard — groceries and the electronics launch notice.
 *
 * Groceries reuse the food vertical's rail, bar, cards and store header, and
 * the cart's line row. So beyond the usual money and fixture rules, the rules
 * here are about reuse staying reuse — and about what the design draws for
 * electronics, which is a notice and nothing more.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FEATURE = join(SRC, "features", "groceries");
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
const raw = (f) => (existsSync(f) ? readFileSync(f, "utf8") : "");
const code = new Map(
  filesUnder(SRC).map((f) => [f, stripComments(readFileSync(f, "utf8"))]),
);
const featureFiles = filesUnder(FEATURE);

const types = read(join(FEATURE, "types.ts"));
const adapter = read(join(SRC, "services", "catalog", "groceries.ts"));
const listing = read(join(FEATURE, "GroceryListing.tsx"));
const storeView = read(join(FEATURE, "StoreView.tsx"));
// Phase 17 moved the panel into the cart feature, where food renders it too.
const storeCart = read(join(SRC, "features", "cart", "StoreCartPanel.tsx"));
const productCard = read(join(FEATURE, "ProductCard.tsx"));
const barrel = read(join(FEATURE, "index.ts"));
const storePage = read(join(SHOP, "groceries", "stores", "[storeId]", "page.tsx"));
const heroPage = read(join(SHOP, "groceries", "page.tsx"));
const foodPage = read(join(SHOP, "food", "page.tsx"));
const electronics = read(join(SHOP, "electronics", "page.tsx"));
const fixturePath = join(APP, "groceries-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  Money is the backend's, verbatim");

check(
  "a product's price is text, and its unit is a sentence",
  /\bprice: string;/.test(types) &&
    /\bunit\?: string;/.test(types) &&
    !/: number/.test(types),
  '"1kg (approx. 6 units)" is not a quantity to multiply and "1.99€" is not a float to round. A number type is the first step to both.',
);

const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|total|amount|subtotal|discount|charges?)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const calculators = featureFiles.filter((f) =>
  (code.get(f) ?? "")
    .split("\n")
    .some((l) => CONVERSION.test(l) || (MONEY_WORD.test(l) && OPERATOR.test(l))),
);
check(
  `nothing in the feature converts or computes money (${featureFiles.length} files)`,
  calculators.length === 0,
  `The backend computes money.\n      ${calculators.map(rel).join("\n      ")}`,
);

check(
  "the store's cart prints the backend's grand total, never a sum of its rows",
  /store\.totals\.total/.test(storeCart) &&
    /store\.totals\.charges\.map\(/.test(storeCart) &&
    !/\.reduce\(/.test(storeCart),
  "A panel that adds its own rows is a panel that can disagree with the checkout that takes payment.",
);

const dictionaryClaims = ["en", "pt"]
  .map((l) => raw(join(SRC, "i18n", "dictionaries", l, "groceries.ts")))
  .join("\n")
  .split("\n")
  .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
  .filter((l) => /\d+\s*%|\d[.,]?\d*\s*€/.test(l));
check(
  "no discount or price is dictionary copy",
  dictionaryClaims.length === 0,
  `"Stock Up & Save up to 30% OFF" is an offer. An offer in a dictionary is a promise nobody in pricing made.\n      ${dictionaryClaims.join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  Nothing is wired, and no store is invented");

const NETWORK = /\bfetch\s*\(|\baxios\b|XMLHttpRequest/;
const callers = featureFiles.filter((f) => NETWORK.test(code.get(f) ?? ""));
check(
  "no file in the feature makes a network call",
  callers.length === 0,
  `Phase 16 connects the catalogue through the API layer.\n      ${callers.map(rel).join("\n      ")}`,
);

const METHODS = ["listStores", "getStore"];
const missing = METHODS.filter((m) => !new RegExp(`\\b${m}\\(`).test(types));
check(
  `the contract names every read and the API adapter implements each (${METHODS.length})`,
  missing.length === 0 &&
    METHODS.every((m) => new RegExp(`async ${m}\\(`).test(adapter)) &&
    /businessType: "STORE"/.test(adapter),
  `A store is a vendor of business type STORE; without the filter the grocery listing is the restaurant listing.\n      ${missing.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The design's sample shelves cannot reach a customer");

const importedPaths = (file, src) =>
  [...src.matchAll(/\bfrom\s*["'](\.[^"']*)["']/g)]
    .map((m) => resolve(dirname(file), m[1]))
    .map((t) => (/\.tsx?$/.test(t) ? t : `${t}.ts`));
const importers = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([f, s]) => importedPaths(f, s).includes(fixturePath))
  .map(([f]) => rel(f));
const stray = importers.filter((f) => !f.includes(`groceries-states${sep}page.tsx`));
check(
  `only the development states page imports the fixture (${importers.length})`,
  existsSync(fixturePath) && importers.length > 0 && stray.length === 0,
  `"FreshMart" and "1.99€" are a picture of the design.\n      ${stray.join("\n      ")}`,
);

check(
  "the states page is on the development-only list",
  DEV_ONLY_ROUTES.includes("groceries-states"),
  "Everything on that list 404s in production and is excluded from the budget on the strength of that.",
);

const shippingApp = [...code]
  .filter(([f]) => f.startsWith(join(SRC, "app") + sep))
  .filter(([f]) => !DEV_ONLY_ROUTES.some((r) => f.includes(`${sep}${r}${sep}`)))
  .map(([, s]) => s)
  .join("\n");
const exported = [...barrel.matchAll(/export \{([^}]+)\} from/g)]
  .flatMap((m) => m[1].split(","))
  .map((n) =>
    n
      .trim()
      .split(/\s+as\s+/)
      .pop()
      .trim(),
  )
  .filter((n) => n && !n.startsWith("type"));
const unused = exported.filter((n) => !new RegExp(`\\b${n}\\b`).test(shippingApp));
check(
  `every value the barrel exports is used by a shipping route (${exported.length})`,
  exported.length > 0 && unused.length === 0,
  `An export nobody renders is bytes on somebody's route.\n      ${unused.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  Reuse stays reuse");

const cardDefiners = [...code]
  .filter(([f]) => !f.startsWith(join(SRC, "features", "food") + sep))
  .filter(([, s]) => /export function \w*(?:Vendor|Store)Card\b/.test(s))
  .map(([f]) => rel(f));
check(
  "a store in the listing is the food vertical's card, not a second one",
  /<VendorCard\b/.test(listing) &&
    /import \{[^}]*\bVendorCard\b[^}]*\} from "@\/features\/food"/.test(listing) &&
    cardDefiners.length === 0,
  `Two store cards drift apart one padding at a time — the seven pinks.\n      ${cardDefiners.join("\n      ")}`,
);

check(
  "the listing's cards lead to the grocery store page",
  /ROUTES\.groceryStore\.path/.test(listing) && /href=\{/.test(listing),
  "Without it every grocery card opens the restaurant page, which draws a menu where the design draws shelves.",
);

check(
  "the store's cart is the cart feature's panel, and its lines are the cart's own row",
  /<CartLineRow\b/.test(storeCart) &&
    /<StoreCartPanel\b/.test(storeView) &&
    /from "@\/features\/cart"/.test(storeView) &&
    !featureFiles.some((f) => /export function \w*Line\w*\(/.test(code.get(f) ?? "")),
  "The same line drawn twice is two places for quantity and removal to disagree.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The screens say which nothing they are showing");

check(
  "the listing tells 'no matches' apart from 'not connected'",
  (listing.match(/<EmptyState\b/g) ?? []).length >= 2 &&
    /unavailable \?/.test(listing) &&
    /copy\.emptyTitle/.test(listing) &&
    /copy\.unavailableTitle/.test(listing),
  "Different sentences, different fixes, and only one of them is the customer's.",
);

check(
  "an unreadable cart does not take the store page down",
  /Promise\.allSettled\(/.test(storePage) &&
    /catalog\.getStore\(storeId\)/.test(storePage) &&
    /readCart\(\)/.test(storePage) &&
    /status === 404\) notFound\(\)/.test(storePage) &&
    (storePage.match(/notFound\(\)/g) ?? []).length === 1,
  "A store that cannot be read is unavailable; a cart that cannot be read is an empty panel. Only the API's own 404 is a 404 — an unreachable catalogue is not.",
);

check(
  "the store page reads the store the URL names",
  /params/.test(storePage) && /getStore\(storeId\)/.test(storePage),
  '`getStore("")` renders the same page for every store id — fine while it rejects, wrong the day it resolves.',
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  Controls are honest about what they do not do yet");

check(
  "the add button carries the product's name",
  /`\$\{addLabel\} \$\{product\.name\}`/.test(productCard),
  "Forty buttons named 'Add to cart' are forty identical buttons to a screen reader.",
);

check(
  "a refused press explains itself instead of being disabled",
  /copy\.signInToAdd/.test(storeView) &&
    /\srole="status"/.test(storeView) &&
    /copy\.actionFailed/.test(storeCart) &&
    /\srole="status"/.test(storeCart) &&
    !/\bdisabled\b/.test(productCard),
  "Phase 8 settled this: a disabled button cannot say why.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§7  Imagery and electronics are what the design has");

check(
  "the grocery hero ships its checked photograph, and food still does not (D-12)",
  /image="\/images\/groceries-hero\.webp"/.test(heroPage) &&
    existsSync(join(ROOT, "public", "images", "groceries-hero.webp")) &&
    !/\bimage=/.test(foodPage),
  "The grocery image was checked and is clean; the food image is a watermarked Adobe Stock comp. Swapping either decision without re-checking is how a watermark ships.",
);

check(
  "electronics is the launch notice and reaches for no catalogue",
  /<ComingSoon\b/.test(electronics) && !/@\/features\//.test(electronics),
  'The design draws "We\'re Coming Soon." and nothing behind it. A listing here would be a product nobody designed.',
);

// ─────────────────────────────────────────────────────────────────────────────
section("§8  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:groceries"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} groceries assertions passed\x1b[0m\n`);
