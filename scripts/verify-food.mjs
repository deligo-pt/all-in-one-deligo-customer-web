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
const adapter = read(join(SRC, "services", "catalog", "food.ts"));
const shared = read(join(SRC, "services", "catalog", "shared.ts"));
const listingPage = read(join(APP, "(shop)", "food", "restaurants", "page.tsx"));
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

const METHODS = ["listVendors", "listCuisines", "getVendor"];
const missing = METHODS.filter((m) => !new RegExp(`\\b${m}\\(`).test(types));
const unimplemented = METHODS.filter((m) => !new RegExp(`async ${m}\\(`).test(adapter));
check(
  `the contract names every read, and the API adapter implements each (${METHODS.join(", ")})`,
  missing.length === 0 &&
    unimplemented.length === 0 &&
    /Promise<FoodCatalog>/.test(adapter),
  `Phase 16: \`services/catalog/food.ts\` is the only implementation.\n      ${[...missing, ...unimplemented].join(", ")}`,
);

check(
  "each read goes to the endpoint measured for it",
  [
    "/vendors/nearby/open",
    "/categories/cuisine/open",
    "/products/open",
    "/product-categories/open",
  ].every((path) => adapter.includes(`"${path}"`) || adapter.includes(`\`${path}/`)) &&
    /businessType: "RESTAURANT"/.test(adapter),
  "`/vendors/customer` returns one vendor; `/vendors/nearby/open/:id` needs the userId; products and their categories take the Mongo `_id`. Each was measured before this was written.",
);

check(
  "the price shown is the API's `finalPrice`, formatted once",
  /money\(p\.finalPrice/.test(adapter) &&
    /formatCurrency\(/.test(shared) &&
    ![adapter, shared].some((src) =>
      src
        .split("\n")
        .some(
          (line) =>
            CONVERSION.test(line) || (MONEY_WORD.test(line) && OPERATOR.test(line)),
        ),
    ),
  "`price` minus `discount` is a second opinion on a number the backend already decided. The discount rule has a FLAT and a PERCENTAGE branch and a BOGO nobody modelled; `finalPrice` has none.",
);

check(
  "every image host the API returns is configured, and none can crash a page",
  /remotePatterns: REMOTE_IMAGE_HOSTS/.test(
    readFileSync(join(ROOT, "next.config.ts"), "utf8"),
  ) &&
    ["res.cloudinary.com", "**.deligo.pt"].every((h) =>
      read(join(SRC, "lib", "imageHosts.ts")).includes(`"${h}"`),
    ) &&
    /unoptimized=\{!shouldOptimiseImage\(src\)\}/.test(
      read(join(SRC, "components", "shared", "ImageSlot.tsx")),
    ),
  "Found on the first real listing: `next/image` throws during render for an unconfigured host, and the API's photos come from res.cloudinary.com and storage-test.deligo.pt.",
);

const grouping = adapter.slice(
  adapter.indexOf("export function groupMenu"),
  adapter.indexOf("export async function vendorProducts"),
);
const productsRead = adapter.slice(
  adapter.indexOf("export async function vendorProducts"),
  adapter.indexOf("/** The food catalogue for this request"),
);
check(
  "no active product is dropped for its category — it goes to 'Other', last",
  /else other\.push\(/.test(grouping) &&
    /if \(other\.length\)[\s\S]*?menu\.push\(/.test(grouping) &&
    /t\("otherCategory"\)/.test(grouping),
  "Found on a live vendor (V-IN0AMES9): active products under a shared category, no vendor categories, and a menu that rendered empty. The old app's rule: unfiled products under \"Other\", after the vendor's own sections.",
);

check(
  "a signed-in customer's menu is the authenticated product list",
  /hasServerSession\(\)[\s\S]*?api\.get\("\/products",/.test(productsRead) &&
    /api\.get\("\/products\/open",/.test(productsRead) &&
    /vendorProducts\(raw\._id\)/.test(adapter),
  "`/products/open` and `/products` are different lists: 2 of 9 products for V-IN0AMES9 on the open one. The old app used `/products` whenever there was a session.",
);

check(
  "an empty menu and a search with no matches are different sentences",
  /vendor\.menu\.length === 0 \?/.test(menu) &&
    /copy\.noMenu\b/.test(menu) &&
    /copy\.noMatches\b/.test(menu),
  '"No items match that search" on a page where nobody searched is a sentence about the wrong thing.',
);

const addBody = menu.slice(
  menu.indexOf("async function add("),
  menu.indexOf("return (", menu.indexOf("async function add(")),
);
check(
  "adding sends the line's absolute quantity — what the cart holds plus what was chosen",
  /quantity: inCart\(item\.id\) \+ 1/.test(menu) &&
    /quantity: inCart\(product\.id, choice\.variationSku\) \+ choice\.quantity/.test(
      menu,
    ),
  "Measured (Phase 17): `/carts/add-to-cart` sets the quantity. Sending 1 for a dish already in the cart twice empties two of them.",
);

check(
  "a preview or a guest never writes a cart",
  addBody.indexOf("if (products)") > -1 &&
    addBody.indexOf("if (!signedIn)") > -1 &&
    addBody.indexOf("if (products)") < addBody.indexOf("cartApi.add(") &&
    addBody.indexOf("if (!signedIn)") < addBody.indexOf("cartApi.add("),
  "The states page renders the fixture with a signed-in session in development; without the check, pressing + there adds a real line to a real cart.",
);

check(
  "the cuisine filter is one slug, in the URL, applied by the API",
  /restaurantCuisineType: cuisine/.test(adapter) &&
    /searchParams/.test(listingPage) &&
    /params\.get\("cuisine"\)/.test(listing),
  "The API matches one slug and silently ignores a list or a display name (measured). A filter that runs in the browser disagrees with the server the first time the list is paginated.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The design's sample content cannot reach a customer");

check(
  "the fixture exists and lives beside the development page",
  existsSync(fixturePath),
  `Expected ${rel(fixturePath)} — sample content in its own file is what makes "does anything else import this?" a question with a mechanical answer.`,
);

/**
 * Who imports *this* fixture — resolved, not spelled.
 *
 * The first version matched the string `from "./fixture"`, which is a
 * spelling. Phase 9 added a second states page with a fixture of its own, and
 * this rule reported it as a food-fixture leak: the pattern could not tell two
 * files apart because it never looked at where either import pointed. Every
 * specifier is now resolved against the importing file and compared to the
 * actual path — the relationship the rule was always about.
 */
const importedPaths = (file, src) =>
  [...src.matchAll(/\bfrom\s*["'](\.[^"']*)["']/g)]
    .map((m) => resolve(dirname(file), m[1]))
    .map((target) => (/\.tsx?$/.test(target) ? target : `${target}.ts`));

const fixtureImporters = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([f, s]) => importedPaths(f, s).includes(fixturePath))
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
  ["the listing", listing, 3],
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
  "the listing tells 'no location', 'no matches' and 'not reachable' apart",
  /unavailable \?/.test(listing) &&
    /vendors\.length === 0 \?/.test(listing) &&
    /copy\.emptyTitle/.test(listing) &&
    /copy\.unavailableTitle/.test(listing) &&
    /copy\.noLocationTitle/.test(listing),
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
