#!/usr/bin/env node
/**
 * Phase 11 guard — orders and notifications. Rewritten in Phase 19, when they
 * went live.
 *
 * Two writes here cannot be taken back: `cancel` ends an order and `review`
 * publishes an opinion under the customer's name that cannot be edited. §2 is
 * that they send exactly what the API was measured to accept.
 *
 * Two more rules exist because the previous project got them wrong in
 * production. Its order list was built from two independent status allowlists,
 * so every status in neither was fetched, held in memory and rendered nowhere.
 * And its notification action was decided from the notification's *type*,
 * which offered "Track Order" on delivered orders and sent people to a page
 * with nothing on it.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FEATURE = join(SRC, "features", "orders");
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

const featureFiles = filesUnder(FEATURE);
const types = read(join(FEATURE, "types.ts"));
const transport = read(join(FEATURE, "api.ts"));
const list = read(join(FEATURE, "OrderList.tsx"));
const detail = read(join(FEATURE, "OrderDetail.tsx"));
const notifications = read(join(FEATURE, "NotificationList.tsx"));
const tracker = read(join(FEATURE, "OrderTracker.tsx"));
const cancelModal = read(join(FEATURE, "CancelModal.tsx"));
const barrel = read(join(FEATURE, "index.ts"));
const serverRead = read(join(SRC, "services", "orders", "server.ts"));
const pushService = read(join(SRC, "services", "push", "browser.ts"));
const listRoute = join(APP, "(account)", "account", "orders", "page.tsx");
const detailRoute = join(
  APP,
  "(account)",
  "account",
  "orders",
  "[orderId]",
  "page.tsx",
);
const statesPage = join(APP, "orders-states", "page.tsx");
const fixturePath = join(APP, "orders-states", "fixture.ts");
const lib = await load("lib/orders.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The totals are the backend's");

check(
  "money on the contract is text, and the total is `payoutSummary.grandTotal`",
  /total: string/.test(types) &&
    !/total: number/.test(types) &&
    /payoutSummary\?\.grandTotal/.test(serverRead),
  "A total the customer was charged is not a number this screen gets to round, and `orderCalculation` has no grand total (measured).",
);

const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|subtotal|amount|total|charge|discount|fee|tip)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const offending = (s) =>
  s
    .split("\n")
    .filter((l) => CONVERSION.test(l) || (MONEY_WORD.test(l) && OPERATOR.test(l)));
const scope = [
  ...featureFiles,
  listRoute,
  detailRoute,
  fixturePath,
  join(SRC, "services", "orders", "server.ts"),
].filter(existsSync);
const calculators = scope.filter((f) => offending(code.get(f) ?? read(f)).length > 0);
check(
  `nothing computes or converts a money value (${scope.length} files)`,
  calculators.length === 0,
  `The backend computes money.\n      ${calculators.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 The writes send exactly what the API accepts");

const WRITES = ["cancel", "reorder", "review", "markRead", "markAllRead"];
const missingWrites = WRITES.filter(
  (m) =>
    !new RegExp(`\\b${m}\\(`).test(types) ||
    !new RegExp(`async ${m}\\(`).test(transport),
);
check(
  `the contract names every write and the client implements each (${WRITES.join(", ")})`,
  missingWrites.length === 0,
  `\`features/orders/api.ts\` is the only implementation.\n      ${missingWrites.join(", ")}`,
);

check(
  "each write goes to the endpoint measured for it, through the lazily loaded client",
  /patch\(`\/orders\/\$\{encodeURIComponent\(orderId\)\}\/cancel`, \{\s*reason,?\s*\}/.test(
    transport,
  ) &&
    /post\(`\/orders\/reorder\//.test(transport) &&
    /post\("\/ratings\/create-rating", body\)/.test(transport) &&
    /\/notifications\/\$\{encodeURIComponent\(id\)\}\/read/.test(transport) &&
    /"\/notifications\/mark-all-as-read"/.test(transport) &&
    /import\("@\/services\/session\/browser"\)/.test(transport) &&
    !/from\s+"@\/services\/session\/browser"|from\s+"axios"/.test(transport),
  "Measured: a cancel needs `{ reason }` (empty is refused); the session client stays off first load (Phase 15).",
);

check(
  "🔴 a cancel cannot be sent without a reason",
  /disabled=\{busy \|\| !reason\}/.test(cancelModal) &&
    /onConfirm\(reason\)/.test(cancelModal),
  "The API refuses an empty reason, and the reason is stored on the order and shown to the store.",
);

const body = lib.ratingBody({
  recordId: "6a82acd5e1064a4bdf977060",
  productIds: ["p1", "p2", "p1"],
  rating: 4,
  review: "  Good  ",
  riderRating: 5,
});
const keys = (o) =>
  Object.keys(o ?? {})
    .sort()
    .join(",");
check(
  "🔴 the rating body is exactly the measured schema, executed",
  keys(body) === "deliveryRating,orderId,productRatings" &&
    body.productRatings.length === 2 &&
    body.productRatings.every(
      (r) =>
        keys(r) === "productId,rating,review" && r.rating === 4 && r.review === "Good",
    ) &&
    keys(body.deliveryRating) === "rating" &&
    lib.ratingBody({ recordId: "x", productIds: [], rating: 0 }) === null &&
    lib.ratingBody({ recordId: "x", productIds: ["p"], rating: 9 }) === null &&
    keys(
      lib.ratingBody({ recordId: "x", productIds: [], rating: 0, riderRating: 3 }),
    ) === "deliveryRating,orderId" &&
    /ratingBody\(input\)/.test(transport),
  "The schema is strict (`vendorRating` was refused by name) and a rating cannot be edited or deleted. One overall score is every product's score (D-20); duplicates, blanks and out-of-range scores never leave.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  🔴 The rules the previous project learned in production");

const buckets = [
  "PENDING",
  "ON_THE_WAY",
  "SOMETHING_NEW",
  "DELIVERED",
  "PICKED_UP_BY_CUSTOMER",
  "CANCELED",
  "REJECTED",
  "NO_SHOW",
].map(lib.orderBucket);
check(
  "every status lands in exactly one tab, executed — an unknown one is ongoing",
  buckets.join() ===
    "ongoing,ongoing,ongoing,complete,complete,cancelled,cancelled,cancelled" &&
    /\.bucket === tab/.test(list) &&
    !/orderStatus/.test(list),
  "Two independent allowlists is what the other project shipped: `NO_SHOW` and collected pickups were fetched and rendered nowhere.",
);

check(
  "the refund is read from `refundStatus` first, executed",
  lib.refundState({
    orderStatus: "CANCELED",
    refundStatus: "PENDING",
    paymentStatus: "PAID",
  }) === "pending" &&
    lib.refundState({
      orderStatus: "CANCELED",
      refundStatus: "NOT_APPLICABLE",
      paymentStatus: "PAID",
    }) === "none" &&
    lib.refundState({ orderStatus: "REJECTED", paymentStatus: "REFUNDED" }) ===
      "refunded" &&
    lib.refundState({ orderStatus: "DELIVERED", refundStatus: "PENDING" }) ===
      undefined,
  "Measured: a cancelled order keeps `paymentStatus: PAID` while the refund is pending, so the payment fields alone promise a refund that may not be coming.",
);

check(
  "cancel is offered only on a live, paid order, executed",
  lib.canCancel("PENDING", true) &&
    lib.canCancel("PREPARING", undefined) &&
    !lib.canCancel("PICKED_UP_BY_CUSTOMER", true) &&
    !lib.canCancel("NO_SHOW", true) &&
    !lib.canCancel("PENDING", false),
  "`PICKED_UP_BY_CUSTOMER` once offered Cancel on food the customer was holding.",
);

check(
  "a code is shown only until it is verified, and never generated",
  /!raw\.deliveryOtp\.verifiedAt/.test(serverRead) &&
    /!raw\.pickup\.verifiedAt/.test(serverRead) &&
    /order\.deliveryCode/.test(detail) &&
    !/Math\.random|generateCode/.test(detail + serverRead),
  "It is what proves the order reaches the right person. A spent code must not linger for somebody to read out, and a made-up one is an invented authentication token.",
);

check(
  "the tracker is a position on the order's own journey, chosen by fulfilment",
  /\bsteps\.indexOf\(/.test(tracker) &&
    !/percent/.test(tracker) &&
    /ORDER_STEPS\[order\.fulfilment\]/.test(detail) &&
    lib.ORDER_STEPS.pickup.at(-1) === "collected" &&
    lib.ORDER_STEPS.delivery.at(-1) === "delivered",
  "A pickup order has no rider and ends at the counter. Phase 13's grocery journey (Picked · Packed) had no API status behind it and was removed.",
);

check(
  "a notification's action comes from the notification's own order",
  /item\.action/.test(notifications) &&
    !/\.type ===/.test(notifications + serverRead) &&
    /item\.data\?\.orderId/.test(serverRead),
  "Deciding the action from the notification's type is how 'Track Order' ended up on delivered orders.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The design's sample orders cannot reach a customer, or the API");

check("the fixture exists", existsSync(fixturePath), `Expected ${rel(fixturePath)}.`);

const importedPaths = (file, s) =>
  [...s.matchAll(/\bfrom\s*["'](\.[^"']*)["']/g)]
    .map((m) => resolve(dirname(file), m[1]))
    .map((t) => (/\.tsx?$/.test(t) ? t : `${t}.ts`));
const importers = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([f, s]) => importedPaths(f, s).includes(fixturePath))
  .map(([f]) => rel(f));
const stray = importers.filter((f) => !f.includes(`orders-states${sep}page.tsx`));
check(
  `only the development states page imports the fixture (${importers.length})`,
  stray.length === 0,
  `"Burger Forge Porto" is a picture of the design.\n      ${stray.join("\n      ")}`,
);

const offlineViews = [list, detail, notifications].every((s) =>
  /if \(offlineNotice\)/.test(s),
);
check(
  "the states page is development-only and sends nothing",
  DEV_ONLY_ROUTES.includes("orders-states") &&
    offlineViews &&
    (read(statesPage).match(/offlineNotice=\{/g) ?? []).length >= 3,
  "The views are live now: a states page without the offline notice would cancel and rate with a fixture's ids.",
);

check(
  "the dialogs arrive through dynamic() and are not on the barrel",
  (detail.match(/dynamic\(/g) ?? []).length >= 2 &&
    !/export \{[^}]*\b(?:ReviewModal|CancelModal|OrderCard|OrderTracker|StarInput)\b/.test(
      barrel,
    ),
  "A static import of a barrel hands the importer every export — 27 KB, 9.3 KB and 11 KB in Phases 6 and 8.",
);

check(
  "foreground push never asks for permission and never rides a feature barrel",
  /Notification\.permission !== "granted"/.test(pushService) &&
    !/requestPermission/.test(pushService) &&
    /import\("firebase\/messaging"\)/.test(pushService) &&
    !/PushListener/.test(barrel) &&
    // Phase 20g moved the mount up to the locale layout: an order update
    // should reach a customer reading a menu, not only one already on their
    // orders. `verify:shell` §8 owns where it is mounted now.
    /<PushListener\b/.test(read(join(APP, "layout.tsx"))),
  "Sign-in asks once (Phase 15). A listener that pulled the orders barrel would ship three screens to every page in the app.",
);

check(
  "the invoice is the API's certified PDF, offered only when it is synced",
  /order\.invoiceReady \?/.test(detail) &&
    /download-invoice-pdf/.test(read(join(SRC, "services", "orders", "browser.ts"))) &&
    !/jspdf/i.test([...code.values()].join("\n")),
  "Measured: an unsynced invoice answers 500. The old app drew its own PDF with jsPDF, which is a document the store did not issue (D-20).",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The screens say which nothing they are showing");

check(
  "the list tells 'no orders', 'no match' and 'could not load' apart",
  /copy\.unavailableTitle/.test(list) &&
    /copy\.emptyTitle/.test(list) &&
    /copy\.noMatchTitle/.test(list),
  "Three sentences with three different fixes.",
);

check(
  "the notifications page tells 'nothing new' apart from 'could not load'",
  /copy\.unavailableTitle/.test(notifications) &&
    /copy\.emptyTitle/.test(notifications),
  "Only one of them is the customer's to act on.",
);

check(
  "an unknown order is 'not found', an unreachable API is 'could not be loaded'",
  /notFoundTitle/.test(read(detailRoute)) &&
    /unavailableTitle/.test(read(detailRoute)) &&
    /status === 404/.test(serverRead),
  "Answering an outage with 'order not found' tells a customer their order is gone.",
);

check(
  "the summary panel is the cart's, without cart controls on a placed order",
  /from "@\/features\/cart"/.test(detail) &&
    /<OrderSummary store=\{order\.store\} copy=\{copy\.summary\} \/>/.test(detail) &&
    !/onPlaceOrder|onApplyVoucher/.test(detail + notifications),
  "A Place Order button on an order that was placed is a control that can only refuse.",
);

check(
  "a live order re-reads itself; a finished one does not",
  /if \(!live \|\| offlineNotice\) return;/.test(detail) &&
    /setInterval\(\(\) => router\.refresh\(\)/.test(detail),
  "A status that moves while the customer watches must move on screen; polling a delivered order is requests for nothing.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a77  The tracking map (Phase 20f)");

const orderMap = read(join(FEATURE, "OrderMap.tsx"));
const mapDetail = detail;
const server = read(join(SRC, "services", "orders", "server.ts"));
const maps = read(join(SRC, "services", "maps", "browser.ts"));

check(
  "the rider's GeoJSON pair is swapped exactly once, where it is read",
  /point\(rider\?\.\[1\], rider\?\.\[0\]\)/.test(server),
  "`currentSessionLocation.coordinates` is [longitude, latitude] — the reverse of every other pair in this codebase, and the difference between a rider in Lisbon and a rider in the Atlantic.",
);

check(
  "a point the API did not place is absent, and 0,0 is not a place",
  /latitude !== 0 \|\| longitude !== 0/.test(server),
  "An unset coordinate arrives as zero, and zero/zero is in the Gulf of Guinea.",
);

check(
  "a pickup order and a finished one have no route",
  /pickup \|\| ended \? undefined : route\(/.test(server),
  "Nobody is carrying a pickup order, and a delivered one is not moving. A map there is a map of nothing.",
);

check(
  "the map is loaded on demand, not with the order page",
  /dynamic\(\(\) => import\("\.\/OrderMap"\)/.test(mapDetail),
  "Google Maps is ~90 KB; an order with no route must not pay for it. The same rule as the location picker and the store dialog.",
);

check(
  "the map mounts from a callback ref",
  /useState<HTMLDivElement \| null>\(null\)/.test(orderMap) &&
    /ref=\{setFrame\}/.test(orderMap),
  "Phase 20d: inside a panel that mounts in one commit, an effect over a `useRef` runs before the node is attached and the map silently never loads.",
);

check(
  "a moved rider redraws the map, and nothing else does",
  /const signature = \[store, destination, rider\]/.test(orderMap) &&
    !/setInterval/.test(orderMap),
  "The detail already polls every 30s; a second clock here would only disagree with it, and a render of the page around it must not rebuild the map.",
);

check(
  "a map that never paints counts as a failure",
  /tilesloaded/.test(maps) && /maps-blank/.test(maps),
  "`RefererNotAllowedMapError` is logged by Google and thrown nowhere: the constructor resolves and the frame stays grey for ever. Measured twice.",
);

check(
  "the pill says which of the two states the map is in",
  /rider \? copy\.live : copy\.waiting/.test(orderMap),
  '"Live tracking" over a map with no rider on it is a claim the screen cannot support.',
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a78  The notifications page is the notifications (Phase 20h fix)");

const model = read(join(SRC, "lib", "orders.ts"));

check(
  "no order summary sits beside the list",
  !/OrderSummary/.test(notifications) && !/activeOrder/.test(notifications),
  "A page called Notifications was showing a cart-shaped panel of an order nobody had asked about, in half the width the reading column should have had. The orders screen is one click away in the menu beside it.",
);

check(
  "the reader gets one language, not both",
  /export function oneLanguage/.test(model) &&
    /oneLanguage\(item\.title/.test(server) &&
    /oneLanguage\(item\.message/.test(server),
  'The API sends both in one string: "…removed from the cart in 28 minutes / O seu …dentro de 28 minutos". An English reader should not be handed the Portuguese half.',
);

check(
  "a message that is not two halves is left whole",
  /if \(parts\.length !== 2\) return text\.trim\(\);/.test(model),
  'A message that legitimately contains " / " must not be cut in half.',
);

check(
  "each row says what it is about before it is read",
  /KIND_ICON\[item\.kind\]/.test(notifications) &&
    /export function notificationKind/.test(model) &&
    /kind: notificationKind\(/.test(server),
  "Every row wore the same bell. The kind comes from the API's type, not from words in the title.",
);

check(
  "a row that leads somewhere is a link, all of it",
  /<Link[\s\S]{0,400}markRead\(item\.id\)/.test(notifications),
  "The old app's rows navigated; a 14px link at the end of a card is a target for a mouse and not for a thumb.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:orders"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} orders assertions passed\x1b[0m\n`);
