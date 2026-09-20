#!/usr/bin/env node
/**
 * Phase 10 guard — checkout. Rewritten in Phase 18, when checkout went live.
 *
 * This one can be wrong in a bank statement. Phase 10 asserted that nothing
 * could be ordered; Phase 18 connects the order and the payment, and the
 * failures that matter change with it:
 *
 *  - **money taken, no order** — the customer pays on REDUNIQ's page and
 *    nothing creates the order afterwards (the old app's `sessionStorage`
 *    finish, lost in another tab). §2 is about that.
 *  - **a second opinion on the amount** — any arithmetic between the backend's
 *    summary and the screen. §1.
 *  - **a card number in our DOM** (D-14), and **controls the API cannot take**
 *    — a tip, a delivery window — pretending to work. §4.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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
const load = (f) => import(pathToFileURL(join(SRC, f)).href);

const featureFiles = [
  ...filesUnder(FEATURE),
  ...filesUnder(join(SRC, "features", "payment")),
];
const types = read(join(FEATURE, "types.ts"));
const transport = read(join(FEATURE, "api.ts"));
const view = read(join(FEATURE, "CheckoutView.tsx"));
const payment = read(join(FEATURE, "PaymentCard.tsx"));
const map = read(join(FEATURE, "MapSlot.tsx"));
const barrel = read(join(FEATURE, "index.ts"));
const serverRead = read(join(SRC, "services", "checkout", "server.ts"));
const checkoutBrowser = read(join(SRC, "services", "checkout", "browser.ts"));
const pendingRoute = read(join(SRC, "app", "api", "checkout", "pending", "route.ts"));
const completeRoute = read(join(SRC, "app", "api", "checkout", "complete", "route.ts"));
const routePage = join(APP, "(checkout)", "checkout", "page.tsx");
const statesPage = join(APP, "checkout-states", "page.tsx");
const fixturePath = join(APP, "checkout-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The amount is the backend's, and nothing here does arithmetic");

check(
  "every money value on the contract is text, and the store is the cart's",
  /total: string/.test(types) &&
    !/(?:subtotal|price|total|amount): number/.test(types) &&
    /import type \{ CartStore \} from "@\/features\/cart"/.test(types),
  "A type that cannot hold a float cannot quietly re-derive the amount a customer is charged.",
);

const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|subtotal|amount|total|charge|discount|fee|tip|vat)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const offending = (src) =>
  src
    .split("\n")
    .filter((l) => CONVERSION.test(l) || (MONEY_WORD.test(l) && OPERATOR.test(l)));

const moneyScope = [
  ...featureFiles,
  routePage,
  fixturePath,
  join(SRC, "services", "checkout", "server.ts"),
  join(SRC, "app", "api", "checkout", "complete", "route.ts"),
].filter(existsSync);
const calculators = moneyScope.filter(
  (f) => offending(code.get(f) ?? read(f)).length > 0,
);
check(
  `nothing computes or converts a money value (${moneyScope.length} files)`,
  calculators.length === 0,
  `The backend prices the summary. A second opinion computed here is how a checkout and the charge that follows it come to disagree.\n      ${calculators.map(rel).join("\n      ")}`,
);

check(
  "the total is the summary's `payoutSummary.grandTotal`, never a sum",
  /payoutSummary\?\.grandTotal/.test(serverRead) && !/\.reduce\(/.test(serverRead),
  "Measured: `payoutSummary.grandTotal` is what is charged and `orderCalculation` has no grand total. Adding the rows up is a promise that our rounding matches theirs.",
);

check(
  "VAT is the API's reported amounts, never a rate applied here",
  // The captions' arguments, not the field names: the raw type declares all
  // three, so a rule on the names alone passed with the caption fed `serviceCharge`.
  /vat\("vatAdded", calc\.serviceChargeVatAmount\)/.test(serverRead) &&
    /vat\("vatIncluded", delivery\.vatAmount\)/.test(serverRead) &&
    /vat\("vatIncluded", calc\.totalTaxAmount\)/.test(serverRead) &&
    !/\b23\b|VAT_RATE|vatRate/.test(serverRead),
  "The old app fell back to a hard-coded 23% when a field was missing. The service charge is net and delivery is gross, and each ships its own VAT amount — the captions print those.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 A payment that leaves the site is finished by this site");

const WRITES = ["start", "applyVoucher", "chooseAddress", "pay"];
const missingWrites = WRITES.filter(
  (m) =>
    !new RegExp(`\\b${m}\\(`).test(types) ||
    !new RegExp(`async ${m}\\(`).test(transport),
);
check(
  `the contract names every write and the client implements each (${WRITES.join(", ")})`,
  missingWrites.length === 0,
  `\`features/checkout/api.ts\` is the only implementation.\n      ${missingWrites.join(", ")}`,
);

check(
  "each write goes to the endpoint measured for it",
  /post\("\/checkout", \{\s*useCart: true,/.test(transport) &&
    /"\/offers\/validate-apply-offer"/.test(transport) &&
    /\/customers\/toggle-delivery-address-status\//.test(transport) &&
    /"\/payment\/reduniq\/create-payment-intent"/.test(transport) &&
    /"\/payment\/reduniq\/pay-with-saved-token"/.test(transport),
  "Measured on the owner's account: `/checkout` takes `useCart` and rejects any address id; the address is changed by making a saved one active.",
);

check(
  "🔴 the checkout is remembered before the redirect, or the customer is not sent to pay",
  /fetch\("\/api\/checkout\/pending", \{\s*method: "POST"/.test(checkoutBrowser) &&
    /return Boolean\(response\?\.ok\)/.test(checkoutBrowser) &&
    /!\(await rememberCheckout\(checkoutId, notes\)\)\s*\) \{[\s\S]{0,300}?handle-payment-failure[\s\S]{0,200}?throw new Error\(\);\s*\}\s*return \{ redirectUrl \};/.test(
      transport,
    ) &&
    /"redirectUrl" in result\) \{\s*window\.location\.assign\(result\.redirectUrl\)/.test(
      view,
    ),
  "Without the remembered checkout, a paid customer comes back to a page that cannot create their order: money taken, no order.",
);

const sessionStorageUsers = [...code]
  .filter(([, s]) => /\bsessionStorage\b/.test(s))
  .map(([f]) => rel(f));
check(
  "🔴 the order is created on our server from the summary's own gateway token — never from sessionStorage",
  /"\/orders\/create-order"/.test(completeRoute) &&
    /gatewayPaymentToken/.test(completeRoute) &&
    /isConvertedToOrder/.test(completeRoute) &&
    sessionStorageUsers.length === 0,
  `The old app finished from \`sessionStorage\`, which a return in another tab does not have. A converted summary must answer with its order, so a reload never orders twice.\n      ${sessionStorageUsers.join("\n      ")}`,
);

check(
  "the remembered checkout is an httpOnly cookie that only this site can set or spend",
  /httpOnly: true/.test(pendingRoute) &&
    [pendingRoute, completeRoute].every((s) => /isSameOrigin\(/.test(s)),
  "Another site able to post here could choose which checkout this browser finishes, or reset one mid-payment.",
);

const lib = await load("lib/checkout.ts");
const ID = "6aa7f35fb7e530b2b778d31c";
check(
  "the pending-checkout rules hold when executed",
  lib.parsePendingCheckout(JSON.stringify({ id: ID, notes: "Ring twice" }))?.notes ===
    "Ring twice" &&
    lib.parsePendingCheckout({ id: "../orders", notes: "" }) === null &&
    lib.parsePendingCheckout("{not json") === null &&
    lib.parsePendingCheckout({ id: ID, notes: 5 }) === null &&
    lib.parsePendingCheckout({ id: ID, notes: "x".repeat(1000) })?.notes.length ===
      lib.DELIVERY_NOTE_MAX &&
    lib.isCheckoutId(ID) &&
    !lib.isCheckoutId("ORD-L7QZMLXPVF"),
  "Only a Mongo id may reach `/checkout/summary/:id` from a cookie or a URL, and the note is bounded.",
);

const staticSession = featureFiles.filter((f) =>
  /import\s[^;]*from\s+"@\/services\/session\/browser"|from\s+"axios"/.test(
    code.get(f) ?? "",
  ),
);
check(
  "axios stays off the first load: the session client is imported on use",
  staticSession.length === 0 &&
    /import\("@\/services\/session\/browser"\)/.test(transport),
  `Measured in Phase 15: a static import put 12 KB on \`/login\` and 6 KB on every account route.\n      ${staticSession.map(rel).join("\n      ")}`,
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
  "the states page is development-only and sends nothing",
  DEV_ONLY_ROUTES.includes("checkout-states") &&
    /offlineNotice=\{/.test(read(statesPage)) &&
    /if \(offlineNotice\) \{/.test(view),
  "Checkout is live: the states page renders the real view, so without the offline notice its buttons would write to the API with a fixture's ids.",
);

const shippingOutside = [...code]
  .filter(([f]) => !f.startsWith(FEATURE + sep))
  .filter(([f]) => !DEV_ONLY_ROUTES.some((r) => f.includes(`${sep}${r}${sep}`)))
  .map(([, s]) => s)
  .join("\n");
const barrelComponents = [
  ...(barrel + read(join(SRC, "features", "payment", "index.ts"))).matchAll(
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
  `every component the barrel exports is rendered by a shipping route (${barrelComponents.length})`,
  barrelComponents.length > 0 && unrendered.length === 0,
  `A static import of a barrel hands the importer every export — measured at 27 KB, 9.3 KB and 11 KB in Phases 6 and 8.\n      ${unrendered.join(", ")}`,
);

const returnPages = ["payment-success", "payment-failed"].map((r) =>
  read(join(APP, "(checkout)", r, "page.tsx")),
);
check(
  "the return routes ship neither the checkout screen nor each other's parts",
  returnPages.every(
    (s) =>
      /from "@\/features\/payment"/.test(s) &&
      !/^import \{[^}]*\} from "@\/features\/checkout"/m.test(s),
  ) &&
    /const ConfirmedModal = dynamic\(/.test(
      read(join(SRC, "features", "payment", "PaymentOutcome.tsx")),
    ),
  "Measured: importing the checkout barrel put `CheckoutView` and the confirmation dialog on `/payment-failed` — 188 KB for one sentence. Type imports are erased; value imports are not.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  Nothing on the screen collects what the API cannot take");

check(
  "🔴 no card number enters this site",
  !/cardNumber|cc-number|cc-csc|autoComplete="cc-/.test(
    featureFiles.map((f) => code.get(f)).join("\n"),
  ),
  "Card details belong to the payment provider (D-14): every method is paid on REDUNIQ's page, and saved cards are tokens.",
);

const gone = [
  "TipCard.tsx",
  "ScheduleCard.tsx",
  "ScheduleModal.tsx",
  "transport.ts",
].filter((f) => existsSync(join(FEATURE, f)));
check(
  "no tip and no delivery window — `/checkout` rejects both (measured)",
  gone.length === 0 && !/\btip\b|slotId|schedul/i.test(transport + types),
  `A control whose choice goes nowhere is the fake this project rules out; the schema answered \`Unrecognized key(s): 'scheduledTime', 'tip'\`.\n      ${gone.join(", ")}`,
);

const dynamics = (view.match(/dynamic\(/g) ?? []).length;
check(
  `both dialogs arrive through dynamic() (${dynamics}/2)`,
  dynamics >= 2 &&
    !/^import \{[^}]*\b(?:AddressModal|VoucherModal)\b[^}]*\} from/m.test(view),
  "A customer who pays with the method already selected opens neither.",
);

check(
  "the map is not a live map",
  !/google\.maps|googleapis|@react-google-maps|GoogleMap|useLoadScript/.test(map) &&
    /ImageSlot/.test(map),
  "Plan.md §6 lists Maps among the things that must never be in a first paint.",
);

const pickup = await load("lib/pickup.ts");
const at0731 = new Date("2026-09-15T06:31:00Z"); // 07:31 in Lisbon, summer time
const restaurant = pickup.pickupDays(
  { openingHours: "07:00", closingHours: "22:30", businessType: "RESTAURANT" },
  at0731,
);
const store = pickup.pickupDays(
  {
    openingHours: "7:00 AM",
    closingHours: "10:30 PM",
    businessType: "STORE",
    closingDays: ["Wednesday"],
  },
  at0731,
);
check(
  "self-pickup offers only the slots the API accepts, executed",
  restaurant.length === 1 &&
    pickup.formatTimeOfDay(restaurant[0].slots[0]) === "08:00" &&
    restaurant[0].slots.every((t) => t.minutes % 30 === 0) &&
    pickup.formatTimeOfDay(restaurant[0].slots.at(-1)) === "22:30" &&
    pickup.slotToIso(
      { date: restaurant[0].date, time: restaurant[0].slots[0] },
      at0731,
    ) === "2026-09-15T07:00:00.000Z" &&
    pickup.slotToIso(
      { date: { year: 2026, month: 1, day: 10 }, time: { hours: 9, minutes: 0 } },
      at0731,
    ) === "2026-01-10T09:00:00.000Z" &&
    store.map((d) => d.slots.length > 0).join() === "true,false,true" &&
    /fulfillmentType: "PICKUP", pickupTime/.test(transport),
  "Measured: a restaurant is today only (`PICKUP_TIME_MUST_BE_TODAY`), a time must start a 30-minute slot (`PICKUP_TIME_NOT_HALF_HOUR_SLOT`), and hours are Lisbon wall-clock. A slot computed in the browser's own time zone would be an hour off for half the year.",
);

check(
  "a pickup survives a rebuild, and delivery sends exactly `{ useCart: true }`",
  /checkoutApi\.start\(checkout\.pickupTime\)/.test(view) &&
    /\.\.\.\(pickupTime \? \{ fulfillmentType: "PICKUP", pickupTime \} : \{\}\)/.test(
      transport,
    ),
  "Removing a voucher rebuilds the summary; without the time it would silently turn a pickup into a delivery with a delivery fee.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The decisions that could be silently undone");

check(
  "payment is a radio group, not six toggles",
  /role="radiogroup"/.test(payment) && /type="radio"/.test(payment),
  "A customer pays one way; a native radio brings arrow keys and one tab stop for free.",
);

check(
  "the summary panel is the cart's, imported rather than restated",
  /from "@\/features\/cart"/.test(view) && /<OrderSummary\b/.test(view),
  "One component in the design and in the code.",
);

check(
  "every write re-reads from the server, and a new summary is a new screen",
  /applyVoucher\(checkout\.id, identifier\);[\s\S]*?router\.refresh\(\)/.test(view) &&
    /router\.replace\(checkoutUrl\(await checkoutApi\.start\(\)\)\)/.test(view) &&
    /key=\{checkout\.id\}/.test(read(routePage)),
  "A voucher reprices this summary; removing one or changing the address builds another. Patching amounts locally is a second opinion, and keeping choices across summaries pays for the wrong one.",
);

check(
  "the secondary reads fail independently",
  /allSettled/.test(read(routePage)),
  "Vouchers that cannot be listed is a sheet that says so and a checkout that still works.",
);

check(
  "the voucher sheet tells 'none apply' apart from 'could not load'",
  /copy\.unavailableTitle/.test(read(join(FEATURE, "VoucherModal.tsx"))) &&
    /copy\.emptyTitle/.test(read(join(FEATURE, "VoucherModal.tsx"))),
  "Only one of them should send a customer looking for a code.",
);

check(
  "a refusal is announced",
  /\srole="status"/.test(view) && /copy\.actionFailed/.test(view),
  "The API's own sentence when there is one, ours when there is not.",
);

const routes = await load("lib/routes.ts");
check(
  "REDUNIQ's return paths are the old app's and exist here",
  routes.ROUTES.paymentSuccess?.path === "/payment-success" &&
    routes.ROUTES.paymentFailed?.path === "/payment-failed",
  "The return URL is configured on the backend. Renaming these strands every paid customer on a 404.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:checkout"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} checkout assertions passed\x1b[0m\n`);
