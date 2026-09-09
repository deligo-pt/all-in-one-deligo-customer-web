#!/usr/bin/env node
/**
 * Phase 10 guard — checkout.
 *
 * Every phase so far has been able to be wrong in public. This one can be
 * wrong in a bank statement.
 *
 * `placeOrder` is the first call in this project that spends money, and the
 * failure it must never have is not a crash — it is a **stub that resolves**.
 * A checkout that answered its own request would put "Order Confirmed!", a
 * reference number and a total in front of a customer for an order that was
 * never placed, and it would look completely right doing it. §2 is that
 * assertion and it is the reason this file exists.
 *
 * The rest follows the shape the last three guards arrived at: money is never
 * computed, sample content cannot reach a shipping page, the screen says which
 * nothing it is showing, and the decisions that could be silently undone —
 * a radio group for payment, an inert card form, one summary panel shared with
 * the cart, four dialogs kept out of the first paint — are each asserted.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FEATURE = join(SRC, "features", "checkout");
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
const code = new Map(
  filesUnder(SRC).map((f) => [f, stripComments(readFileSync(f, "utf8"))]),
);

const featureFiles = filesUnder(FEATURE);
const types = read(join(FEATURE, "types.ts"));
const transport = read(join(FEATURE, "transport.ts"));
const view = read(join(FEATURE, "CheckoutView.tsx"));
const payment = read(join(FEATURE, "PaymentCard.tsx"));
const map = read(join(FEATURE, "MapSlot.tsx"));
const barrel = read(join(FEATURE, "index.ts"));
const routePage = join(APP, "(checkout)", "checkout", "page.tsx");
const fixturePath = join(APP, "checkout-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The amount is the backend's, and this screen does no arithmetic");

check(
  "every money value on the contract is text",
  // Checkout declares exactly one money field of its own — the total it
  // reports back. Everything else it renders belongs to `CartStore`, which it
  // re-exports rather than restating, so the first version of this rule looked
  // for `subtotal`/`price` in a file that correctly does not contain them.
  // Asserting the import is what covers the rest; §5 does that.
  /total: string/.test(types) &&
    !/(?:subtotal|price|total|amount): number/.test(types) &&
    /import type \{ CartStore \} from "@\/features\/cart"/.test(types),
  "This is the screen where `toFixed(2)` stops being a style question. A type that cannot hold a float cannot quietly re-derive the amount a customer is charged — and a second order type here, rather than the cart's, is how the two come to disagree about what is being bought.",
);

check(
  "the tip is an amount the customer picks, not a number the page adds",
  /TIP_OPTIONS: readonly string\[\]/.test(read(join(FEATURE, "paymentMethods.ts"))),
  "A tip changes the total, and the total comes back from the server with the tip already in it. Typing these as numbers is an invitation to patch the total here and disagree with the charge.",
);

/** Conversion is banned outright; arithmetic needs a money word on the same
 *  line and a *spaced* operator. The shape `verify:food` reached after four
 *  rewrites, inherited rather than re-derived. */
const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|subtotal|amount|total|charge|discount|fee|tip)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const offending = (src) =>
  src
    .split("\n")
    .filter((l) => CONVERSION.test(l) || (MONEY_WORD.test(l) && OPERATOR.test(l)));

const moneyScope = [...featureFiles, routePage, fixturePath].filter(existsSync);
const calculators = moneyScope.filter(
  (f) => offending(code.get(f) ?? read(f)).length > 0,
);
check(
  `nothing computes or converts a money value (${moneyScope.length} files)`,
  calculators.length === 0,
  `The backend computes money. A second opinion computed here is how a checkout and the charge that follows it come to disagree.\n      ${calculators.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 Nothing can be ordered, and nothing pretends otherwise");

const rejects = (transport.match(/Promise\.reject\(/g) ?? []).length;
check(
  `every method of the shipped transport fails (${rejects}/4 reject)`,
  rejects >= 4,
  "A `read` that resolved would show an invented cart. A `placeOrder` that resolved would show an order confirmation, a reference number and a total for an order that does not exist — and it would look completely right. There is no version of that file which pretends.",
);

check(
  "🔴 `placeOrder` in particular rejects",
  /placeOrder\(\)\s*\{\s*return Promise\.reject\(/.test(transport),
  "This is the one call in the project that spends money. Everything else in this guard is precaution; this is the assertion.",
);

const NETWORK = /\bfetch\s*\(|\baxios\b|XMLHttpRequest/;
const callers = featureFiles.filter((f) => NETWORK.test(code.get(f) ?? ""));
check(
  "no file in the feature makes a network call",
  callers.length === 0,
  `Track B builds the screens and Phase 18 connects them. A request placed here now is one the API layer will not know about — no interceptor, no token refresh, no error normalisation.\n      ${callers.map(rel).join("\n      ")}`,
);

const METHODS = ["read", "listVouchers", "listSlots", "placeOrder"];
const missing = METHODS.filter((m) => !new RegExp(`\\b${m}\\b`).test(types));
check(
  `the contract names every call the screen makes (${METHODS.join(", ")})`,
  missing.length === 0,
  `A contract missing one of these is a control Phase 18 has to redesign around.\n      ${missing.join(", ")}`,
);

check(
  "the three reads fail independently",
  /allSettled/.test(read(routePage)),
  "Vouchers that cannot be listed is a sheet that says so and a checkout that still works. `Promise.all` would let one rejection take the page down with it.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The design's sample checkout cannot reach a customer");

check(
  "the fixture exists and lives beside the development page",
  existsSync(fixturePath),
  `Expected ${rel(fixturePath)}.`,
);

const importedPaths = (file, src) =>
  [...src.matchAll(/\bfrom\s*["'](\.[^"']*)["']/g)]
    .map((m) => resolve(dirname(file), m[1]))
    .map((t) => (/\.tsx?$/.test(t) ? t : `${t}.ts`));

const importers = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([f, s]) => importedPaths(f, s).includes(fixturePath))
  .map(([f]) => rel(f));
const stray = importers.filter((f) => !f.includes(`checkout-states${sep}page.tsx`));
check(
  `only the development states page imports the fixture (${importers.length} importer${importers.length === 1 ? "" : "s"})`,
  stray.length === 0,
  `"DELIGO20" and "30.97€" are a picture of the design. One import from a shipping page is how a picture becomes a charge.\n      ${stray.join("\n      ")}`,
);

check(
  "the states page is on the development-only list",
  DEV_ONLY_ROUTES.includes("checkout-states"),
  "`verify:shell` asserts everything on that list 404s in production, and `verify:bundle` excludes it from the budget on the strength of that.",
);

check(
  "no dialog is a value export of the barrel",
  !/export \{[^}]*\b(?:LocationModal|VoucherModal|ScheduleModal|ConfirmedModal|PaymentCard|DeliveryCard|TipCard|ScheduleCard|MapSlot)\b/.test(
    barrel,
  ),
  "A static import of a barrel hands the importer every export — measured at 27 KB, 9.3 KB and 11 KB in Phases 6 and 8. This route carries four dialogs, more than any other, and none of them belongs to anybody else.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  Four dialogs, none of them in the first paint");

const dynamics = (view.match(/dynamic\(/g) ?? []).length;
check(
  `every dialog arrives through dynamic() (${dynamics}/4)`,
  dynamics >= 4,
  "A Radix dialog, a map slot, a date grid and a voucher list. A customer who pays with the method already selected opens none of them, and this route is the most dialog-heavy in the application.",
);

check(
  "the map is not a live map",
  // Named things, not a keyword sweep. The first version banned `/maps/i`,
  // which matches this component's own name — `MapSlot` — so it reported the
  // file for existing. A guard that flags the thing it is protecting is a
  // guard people learn to switch off.
  !/google\.maps|googleapis|@react-google-maps|GoogleMap|useLoadScript/.test(map) &&
    /ImageSlot/.test(map),
  "Track B has no API key, no address to centre on and nothing for a marker to mean. Mounting Maps to show a customer a blank default location costs the budget a script tag and tells them nothing — Plan.md §6 lists it among the things that must never be in a first paint.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The decisions that could be silently undone");

check(
  "payment is a radio group, not six toggles",
  /role="radiogroup"/.test(payment) && /type="radio"/.test(payment),
  "A customer pays one way. `aria-pressed` on six buttons says each is independently on or off, which is a different promise — and a native radio brings arrow keys and one tab stop for the group without shipping a line of JavaScript.",
);

check(
  "🔴 the card form collects nothing",
  (payment.match(/disabled\b/g) ?? []).length >= 4 &&
    !/autoComplete="cc-|autoComplete="on"/.test(payment),
  "Card details belong to the payment provider. A real number through this application's DOM puts it in PCI scope for no benefit — the old app pays through REDUNIQ's own form and this one will too (D-14). The four inputs are inert and the notice under them says so.",
);

check(
  "the summary panel is the cart's, imported rather than restated",
  /from "@\/features\/cart"/.test(view) && /OrderSummary/.test(view),
  "The design draws the same 415px panel on both screens and D-4 makes one store one order. A second copy here is how the cart and the checkout come to disagree about what is being bought — and how the previous project ended up with seven pinks.",
);

check(
  "the confirmation can be reached by a payment that left the site",
  /placed\?: PlacedOrder/.test(view),
  "MB WAY, PayPal and 3-D Secure all return to a URL. What the customer must see on arrival is the confirmation, not the form they have already paid on — so the order is resolved by the server and handed in, not only produced by a click here.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The screen says which nothing it is showing");

check(
  "checkout tells 'not connected' apart from an empty cart",
  /copy\.unavailableTitle/.test(view) && /unavailable \|\| !checkout/.test(view),
  "Different sentences, different fixes, and neither of them is the customer's.",
);

for (const [name, source] of [
  ["the voucher sheet", read(join(FEATURE, "VoucherModal.tsx"))],
  ["the delivery picker", read(join(FEATURE, "ScheduleModal.tsx"))],
]) {
  check(
    `${name} tells 'none available' apart from 'not connected'`,
    // Rendered, not merely declared. A field on a copy type proves the string
    // was thought about; `copy.x` in the tree proves it reaches the screen —
    // and it is the *pair* that matters, since collapsing one into the other
    // is the failure being guarded against.
    /copy\.unavailableTitle/.test(source) && /copy\.emptyTitle/.test(source),
    "A customer with no vouchers and a voucher list that cannot be read see the same blank sheet otherwise, and only one of them should go looking for a code.",
  );
}

check(
  "a refused control explains itself instead of being disabled",
  /copy\.notWired/.test(view) && /\srole="status"/.test(view),
  "Phase 8 settled this on the dish modal: a button that cannot be pressed cannot say why. `Place Order`, `Locate me` and `Apply` are all pressable, all refuse, and the refusal is announced.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§7  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:checkout"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} checkout assertions passed\x1b[0m\n`);
