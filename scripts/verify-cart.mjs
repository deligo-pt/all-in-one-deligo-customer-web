#!/usr/bin/env node
/**
 * Phase 9 guard — the cart.
 *
 * The cart is the first screen where being wrong costs money rather than
 * credibility. A listing that shows a stale price is embarrassing; a cart that
 * computes its own total is a screen that can quietly disagree with the one
 * that takes the payment, and the customer finds out at the card.
 *
 * So the rules here are about arithmetic, about the seam, and about the two
 * structural decisions this phase had to make and could get wrong silently:
 * that a store group is the unit of checkout (D-4), and that the tab row is
 * derived from the cart rather than declared.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FEATURE = join(SRC, "features", "cart");
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

/** Same character-walking stripper as the other six guards, kept identical on
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
const code = new Map(
  filesUnder(SRC).map((f) => [f, stripComments(readFileSync(f, "utf8"))]),
);

const featureFiles = filesUnder(FEATURE);
const types = read(join(FEATURE, "types.ts"));
const transport = read(join(FEATURE, "api.ts"));
const serverRead = read(join(SRC, "services", "cart", "server.ts"));
const sidePanel = read(join(FEATURE, "StoreCartPanel.tsx"));
const summary = read(join(FEATURE, "summary.ts"));
const view = read(join(FEATURE, "CartView.tsx"));
const group = read(join(FEATURE, "StoreGroup.tsx"));
const panel = read(join(FEATURE, "OrderSummary.tsx"));
const routePage = join(APP, "(checkout)", "cart", "page.tsx");
const fixturePath = join(APP, "cart-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The money is the backend's, and this screen does no arithmetic");

check(
  "the cart types money as text, not as a number",
  /price: string/.test(types) &&
    /subtotal\??: string/.test(types) &&
    /amount: string/.test(types) &&
    !/(?:price|subtotal|amount|total): number/.test(types),
  "A `number` invites a `toFixed(2)`, then a rounding rule, then a currency symbol chosen here. Plan.md §2.2 carries one rule from the old app: money is displayed exactly as returned. A type that cannot hold a float cannot quietly re-derive one.",
);

check(
  "quantity is a number and is the only thing that is",
  // Anchored on a type *member* — indented, on its own line, terminated. The
  // loose version matched `setQuantity(lineId: string, quantity: number)` in
  // the transport signature, so it was satisfied by a line that has nothing to
  // do with the field it claims to be about: a guard watching the wrong
  // occurrence, which is the fourth time this project has found one.
  /^ {2}quantity: number;$/m.test(types),
  "The one sum this feature performs is a count of items. Typing that as a string to be safe would push the counting somewhere less visible.",
);

/**
 * Two rules, because they fail differently — the shape `verify:food` arrived at
 * after four rewrites, and inherited here rather than re-derived.
 *
 * **Conversion is banned outright.** `toFixed`, `parseFloat` and `Number(` have
 * no honest use here: every money value arrives as text and leaves as text. No
 * money word is required nearby, because the version that required one walked
 * straight past `{(1.0).toFixed(2)}` — the mutation had removed the word the
 * rule was keyed to.
 *
 * **Arithmetic needs a money word on the same line and a *spaced* operator.**
 * Unspaced `-` and `/` are everywhere in this code and mean nothing arithmetic:
 * `size-4`, `line-subtle`, `</p>`.
 */
const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|subtotal|amount|total|charge|discount|fee)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const offendingLines = (src) =>
  src
    .split("\n")
    .filter(
      (line) => CONVERSION.test(line) || (MONEY_WORD.test(line) && OPERATOR.test(line)),
    );

// The route and the fixture are checked with the feature. The route is where a
// "just add the stores up for the header pill" would land, and the fixture is
// where an invented price would.
const moneyScope = [...featureFiles, routePage, fixturePath].filter(existsSync);
const calculators = moneyScope.filter(
  (f) => offendingLines(code.get(f) ?? read(f)).length > 0,
);
check(
  `nothing computes or converts a money value (${moneyScope.length} files)`,
  calculators.length === 0,
  `The backend computes money. Every subtotal, fee, discount and grand total the customer reads is one it has already decided, and a second opinion computed here is how a cart and a checkout come to disagree.\n      ${calculators.map(rel).join("\n      ")}`,
);

check(
  "the grand total is a field, not a sum of the rows above it",
  /total: string/.test(types) && !/charges\.reduce/.test(panel),
  "The summary panel prints five charge rows and a total. Deriving the total from the rows looks like a saving and is a promise that the backend's arithmetic matches ours — including its rounding, its VAT and its discount ceiling.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  Nothing is wired, and no cart is invented");

const NETWORK = /\bfetch\s*\(|\baxios\b|XMLHttpRequest/;
const callers = featureFiles.filter((f) => NETWORK.test(code.get(f) ?? ""));
check(
  "no file in the feature makes a network call",
  callers.length === 0,
  `Track B builds the screens and Phase 17 connects them. A request placed here now is one the API layer will not know about — no interceptor, no token refresh, no error normalisation.\n      ${callers.map(rel).join("\n      ")}`,
);

const METHODS = ["setQuantity", "remove", "select", "add"];
const missing = METHODS.filter((m) => !new RegExp(`\\b${m}\\(`).test(types));
const unimplemented = METHODS.filter(
  (m) => !new RegExp(`async ${m}\\(`).test(transport),
);
check(
  `the contract names every write, and the client transport implements each (${METHODS.join(", ")})`,
  missing.length === 0 && unimplemented.length === 0,
  `Phase 17. \`features/cart/api.ts\` is the only implementation.\n      ${[...missing, ...unimplemented].join(", ")}`,
);

check(
  "each write goes to the endpoint measured for it, and removal is never a zero",
  /post\("\/carts\/add-to-cart"/.test(transport) &&
    /delete\("\/carts\/delete-item"/.test(transport) &&
    /patch\("\/carts\/toggle-item-status"/.test(transport) &&
    /toggleMode: "VENDOR_BULK"/.test(transport) &&
    !/quantity:\s*0\b/.test(transport),
  "Measured: quantity 0 is a validation error, removal is `delete-item`, and the store switch is `VENDOR_BULK`.",
);

check(
  "selecting a store never toggles the active one off",
  /if \(store\.active\) return;/.test(transport),
  "`toggle-item-status` is a toggle: sent for the active store it deactivates it, and the cart is left with no order to check out.",
);

check(
  "the cart is read on the server, and only the active store carries totals",
  /\/carts\/view-cart/.test(serverRead) &&
    /\.\.\.\(active\s*\?/.test(serverRead) &&
    /calc\.grandTotal/.test(serverRead) &&
    !/\.reduce\(/.test(serverRead),
  "`cartCalculation` is the backend's sum over active lines (measured: adding from a second store deactivated the first and the total followed). A store total for an inactive store would be one this screen made up.",
);

check(
  "every write re-reads the cart, failed or not",
  [view, sidePanel].every((src) => /finally \{\s*router\.refresh\(\);/.test(src)),
  "An optimistic cart is a second opinion on quantities and prices; the server's cart is re-rendered after each write instead.",
);

check(
  "`setQuantity` sets rather than increments",
  /setQuantity\(line: CartLine, quantity: number\)/.test(types) &&
    !/\bincrement\b/.test(types),
  "`/carts/add-to-cart` **sets** the quantity of a line; the old app proves it. An interface promising increments would have to fake them on top of a set, which is how two tabs of the same cart end up disagreeing.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The design's sample cart cannot reach a customer");

check(
  "the fixture exists and lives beside the development page",
  existsSync(fixturePath),
  `Expected ${rel(fixturePath)} — sample content in its own file is what makes "does anything else import this?" a question with a mechanical answer.`,
);

/**
 * Who imports *this* fixture — resolved, not spelled.
 *
 * `verify:food` asked the same question by matching `from "./fixture"`, and
 * this phase is what proved that wrong: a second states page with a fixture of
 * its own was reported as a leak of the first one's. Both guards now resolve
 * the specifier against the importing file and compare paths.
 */
const importedPaths = (file, src) =>
  [...src.matchAll(/\bfrom\s*["'](\.[^"']*)["']/g)]
    .map((m) => resolve(dirname(file), m[1]))
    .map((target) => (/\.tsx?$/.test(target) ? target : `${target}.ts`));

const fixtureImporters = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([f, s]) => importedPaths(f, s).includes(fixturePath))
  .map(([f]) => rel(f));
const strayImporters = fixtureImporters.filter(
  (f) => !f.includes(`cart-states${sep}page.tsx`),
);
check(
  `only the development states page imports the cart fixture (${fixtureImporters.length} importer${fixtureImporters.length === 1 ? "" : "s"})`,
  strayImporters.length === 0,
  `"Pizza Hut Lisbon" and "12.50€" are a picture of the design, not a cart. One import from a shipping page is how a picture becomes a charge.\n      ${strayImporters.join("\n      ")}`,
);

check(
  "the states page is on the development-only list",
  DEV_ONLY_ROUTES.includes("cart-states"),
  "`verify:shell` asserts everything on that list 404s in production, and `verify:bundle` excludes it from the budget on the strength of that. A page holding a sample cart that is *not* on the list is a page a customer can open.",
);

/**
 * Every component on the barrel is rendered by shipping code outside the
 * feature. Phase 9 banned names (`StoreGroup|CartLineRow|VerticalTabs`);
 * Phase 10 removed `OrderSummary` from that list and Phase 13 needed
 * `CartLineRow` for the grocery store's panel. The rule was never a list of
 * names — it is that no component reaches an importer that never renders it,
 * which is what cost 27 KB, 9.3 KB and 11 KB in Phases 6 and 8.
 */
const shippingOutside = [...code]
  .filter(([f]) => !f.startsWith(FEATURE + sep))
  .filter(([f]) => !DEV_ONLY_ROUTES.some((r) => f.includes(`${sep}${r}${sep}`)))
  .map(([, s]) => s)
  .join("\n");
const barrelComponents = [
  ...read(join(FEATURE, "index.ts")).matchAll(
    /export \{([^}]+)\} from "\.\/([A-Z]\w*)"/g,
  ),
]
  .flatMap((m) => m[1].split(","))
  .map((n) => n.trim())
  .filter((n) => /^[A-Z]/.test(n));
const unrendered = barrelComponents.filter(
  (n) => !new RegExp(`<${n}\\b`).test(shippingOutside),
);
check(
  `every component the barrel exports is rendered outside the feature (${barrelComponents.length})`,
  barrelComponents.length > 0 && unrendered.length === 0,
  `A static import of a barrel hands the importer every export. Three times this project has shipped a component to a route that never rendered it — 27 KB and 9.3 KB in Phase 6, 11 KB in Phase 8.\n      ${unrendered.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The screen says which nothing it is showing");

const emptyStates = (view.match(/<EmptyState\b/g) ?? []).length;
check(
  `the cart renders both of its nothings (${emptyStates}/2)`,
  emptyStates >= 2,
  "Empty and not-connected are two different sentences with two different fixes, and only one of them is the customer's. Losing one leaves the other answering for both.",
);

check(
  "empty is told apart from not-connected",
  /stores\.length === 0/.test(view) &&
    /copy\.emptyTitle/.test(view) &&
    /copy\.unavailableTitle/.test(view),
  '"Your cart is empty" tells someone to go shopping. If the cart is merely unreachable, that sends them to fill a cart that will look empty again.',
);

check(
  "a refused control explains itself instead of being disabled",
  /copy\.notWired/.test(view) && /\srole="status"/.test(view),
  "Phase 8 settled this on the dish modal: a button that cannot be pressed cannot say why. The stepper, `Remove`, the voucher row and `Place Order` are all pressable, all refuse, and the refusal is announced.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The two structural decisions, asserted");

check(
  "a store group carries its own totals, because a store group is one order",
  /totals\?: CartTotals/.test(types) && /store\.totals\?\.total/.test(panel),
  "D-4 assumes the backend cannot place one order across two vendors. Hanging a single `totals` off the cart would encode the opposite, and the summary panel would have nothing to be about.",
);

check(
  "the summary panel is the API's active store, while the filter still shows it",
  /visible\.find\(\(store\) => store\.active\)/.test(view) &&
    /copy\.selectToSeeTotal/.test(view),
  "A `Place Order` describing a store that the Groceries tab has just hidden is a button aimed at something invisible. Derived at render, not synchronised in an effect — `set-state-in-effect` is a mistake this project has already made twice.",
);

check(
  "the tab row is derived from the cart, not declared",
  /buildTabs/.test(summary) && /entry\.n > 0/.test(summary),
  "A fixed row shows `Electronics (0)` to somebody who has only ordered dinner, and a tab that filters to nothing is a control that can only disappoint.",
);

check(
  "choosing a store is a radio group, not a pressed button",
  /role="radiogroup"/.test(view) && /type="radio"/.test(group),
  "The choice is one-of-many. `aria-pressed` says each store is independently on or off, which is a different promise; and a native radio brings arrow-key navigation and a single tab stop for the group without shipping a line of JavaScript.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The counted strings are resolved on the server");

check(
  "plurals are chosen by Intl, in one place",
  /reduce\(/.test(summary) &&
    !/=== 1 \?/.test(view) &&
    !/\bplural\b/.test(view.toLowerCase()),
  "`{count} item` versus `{count} items` is `Intl.PluralRules`' answer, and `@/lib/i18n/translate` explains why `n === 1` is the comparison nobody finds again when a three-form language arrives. The view receives finished text.",
);

const route = read(routePage);
check(
  "the header pill counts, and carries no money",
  !/cart\.total/.test(route) && !/\breduce\b/.test(route),
  "The count is the whole cart's; `cartCalculation` is the **active store's** alone. Printing them side by side described one store's money as the cart's, and adding the stores up to fix that would invent a number nobody agreed to (D-4). The store's own total is on its card; the breakdown is in the summary.",
);

check(
  "each store's total is printed once, on its own card",
  /store\.subtotal \? `\$\{itemsLabel\} \u00b7 \$\{store\.subtotal\}` : itemsLabel/.test(
    group,
  ) && !/copy\.subtotal\}: \$\{store\.subtotal/.test(group),
  "It was in the card's header badge and again as a 24px line in its footer, and the second one sat directly opposite the summary's own Subtotal — a different number under the same word.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a78  Editing an add-on (Phase 20e)");

const api = read(join(FEATURE, "api.ts"));
const row = read(join(FEATURE, "CartLineRow.tsx"));
const cartServer = read(join(SRC, "services", "cart", "server.ts"));

check(
  "the add-on write carries the line's own quantity",
  /setAddonQuantity[\s\S]{0,400}quantity: line\.quantity/.test(api),
  "`/carts/add-to-cart` requires it and **sets** it: sending the add-on alone resets the line to one. The old app learned this the expensive way.",
);

check(
  "it names one add-on by its option sku, so the others survive",
  /addons: \[\{ optionSku, quantity \}\]/.test(api),
  "The endpoint merges add-ons by `optionSku`; a full list would delete every add-on left out of it.",
);

check(
  "the add-on stepper goes to zero, and the line's does not",
  /min=\{0\}/.test(row) && /min=\{1\}/.test(row),
  "Removing an add-on is not removing the dish. The line keeps its own Remove control, so its stepper must not mean two things.",
);

check(
  "an add-on's price is the API's own total, formatted once",
  /price: money\(a\.lineTotal, locale\)/.test(cartServer),
  "\u00a71 again: a unit price times a quantity computed here is a cart that can disagree with the checkout that charges it.",
);

check(
  "only an add-on the API can be told about becomes a control",
  /\.filter\(\(a\) => a\.sku && a\.name\)/.test(cartServer),
  "Without an `optionSku` there is nothing to send back, and a stepper that cannot write is worse than a line of text.",
);

check(
  "the joined label and the editable rows are alternatives, never both",
  /onAddonQuantityChange && line\.addons\.length > 0 \? \([\s\S]{0,1800}\) : line\.optionsLabel \? \(/.test(
    row,
  ),
  "The compact contexts (the vendor page's cart panel) keep the one-line label; the cart page shows the controls. Rendering both prints every add-on twice.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§7  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:cart"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} cart assertions passed\x1b[0m\n`);
