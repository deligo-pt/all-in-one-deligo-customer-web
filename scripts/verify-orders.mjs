#!/usr/bin/env node
/**
 * Phase 11 guard — orders and notifications.
 *
 * Two writes here cannot be taken back: `cancel` ends an order and `review`
 * publishes an opinion under the customer's name. A stub that resolved would
 * tell them both happened when neither did — §2.
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
import { fileURLToPath } from "node:url";
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

const featureFiles = filesUnder(FEATURE);
const types = read(join(FEATURE, "types.ts"));
const transport = read(join(FEATURE, "transport.ts"));
const list = read(join(FEATURE, "OrderList.tsx"));
const detail = read(join(FEATURE, "OrderDetail.tsx"));
const notifications = read(join(FEATURE, "NotificationList.tsx"));
const tracker = read(join(FEATURE, "OrderTracker.tsx"));
const barrel = read(join(FEATURE, "index.ts"));
const listRoute = join(APP, "(account)", "account", "orders", "page.tsx");
const fixturePath = join(APP, "orders-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The totals are the backend's");

check(
  "money on the contract is text",
  /total: string/.test(types) && !/total: number/.test(types),
  "A total the customer was charged is not a number this screen gets to round.",
);

const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|subtotal|amount|total|charge|discount|fee|tip)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const offending = (s) =>
  s
    .split("\n")
    .filter((l) => CONVERSION.test(l) || (MONEY_WORD.test(l) && OPERATOR.test(l)));
const scope = [...featureFiles, listRoute, fixturePath].filter(existsSync);
const calculators = scope.filter((f) => offending(code.get(f) ?? read(f)).length > 0);
check(
  `nothing computes or converts a money value (${scope.length} files)`,
  calculators.length === 0,
  `The backend computes money.\n      ${calculators.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 Nothing can be cancelled, reordered or reviewed");

const rejects = (transport.match(/Promise\.reject\(/g) ?? []).length;
check(
  `every method of the shipped transport fails (${rejects}/6 reject)`,
  rejects >= 6,
  "`cancel` ends an order and `review` publishes an opinion under the customer's name. Neither can be undone, and a stub that resolved would report both as done.",
);

const NETWORK = /\bfetch\s*\(|\baxios\b|XMLHttpRequest/;
const callers = featureFiles.filter((f) => NETWORK.test(code.get(f) ?? ""));
check(
  "no file in the feature makes a network call",
  callers.length === 0,
  `Phase 19 connects these. A request placed here now bypasses the API layer entirely.\n      ${callers.map(rel).join("\n      ")}`,
);

const METHODS = ["list", "get", "cancel", "reorder", "review", "notifications"];
const missing = METHODS.filter((m) => !new RegExp(`\\b${m}\\b`).test(types));
check(
  `the contract names every call the screens make (${METHODS.join(", ")})`,
  missing.length === 0,
  `Missing: ${missing.join(", ")}`,
);

check(
  "the review sends a score and never a rider id",
  /riderRating\?: number/.test(types) && !/riderId/.test(types),
  "The backend takes the rider from the order. Sending one is an unknown field that fails the whole request — the contract the other project was rebuilt to this week.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  🔴 Two rules the previous project learned in production");

check(
  "the list filters on one field the API decides, not on a status allowlist",
  /\.bucket === tab/.test(list) && !/orderStatus/.test(list),
  "Two independent allowlists is what the other project shipped: an order whose status was in neither was fetched, held in memory and rendered nowhere, and the customer searching their own order id got 'no results'.",
);

check(
  "a notification's action comes from the notification, not from its type",
  /item\.action/.test(notifications) && !/\.type ===/.test(notifications),
  "Deciding the action from the notification's type is how 'Track Order' ended up on delivered orders, sending people to a page with nothing on it.",
);

check(
  "the notification filters are derived from what arrived",
  // The derivation itself, not a variable name. The first version grepped for
  // `present`, which a rename walks straight past — and a name is not a rule.
  /groups\.flatMap\(/.test(read(join(APP, "(account)", "notifications", "page.tsx"))) &&
    /n\.vertical/.test(read(join(APP, "(account)", "notifications", "page.tsx"))),
  "A `Ride (0)` chip on an account that has never booked one is a control that can only disappoint. Same rule the cart's tabs follow.",
);

check(
  "the tracker is a position on a known list, not a percentage",
  /ORDER_STEPS\.indexOf\(/.test(tracker) && !/percent/.test(tracker),
  "A number would put the frontend in charge of deciding what 60% of an order looks like.",
);

check(
  "the delivery code is rendered, never generated",
  /order\.deliveryCode/.test(detail) && !/Math\.random|generateCode/.test(detail),
  "It is what proves the courier is handing the order to the right person. A frontend that made one up would be inventing an authentication token.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The design's sample orders cannot reach a customer");

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
  `"Burger Forge Porto" and "15.60€" are a picture of the design.\n      ${stray.join("\n      ")}`,
);

check(
  "the states page is on the development-only list",
  DEV_ONLY_ROUTES.includes("orders-states"),
  "`verify:shell` asserts it 404s in production and `verify:bundle` excludes it on the strength of that.",
);

check(
  "the review dialog is not a value export of the barrel",
  !/export \{[^}]*\b(?:ReviewModal|OrderCard|OrderTracker|StarInput)\b/.test(barrel),
  "A static import of a barrel hands the importer every export — 27 KB, 9.3 KB and 11 KB in Phases 6 and 8.",
);

check(
  "the review dialog arrives through dynamic()",
  /dynamic\(/.test(detail),
  "Two star groups and a textarea, and most visits to an order never open it.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The screens say which nothing they are showing");

for (const [name, source] of [
  ["the list", list],
  ["the notifications page", notifications],
]) {
  check(
    `${name} tells 'nothing yet' apart from 'not connected'`,
    /copy\.unavailableTitle/.test(source) && /copy\.emptyTitle/.test(source),
    "Different sentences, different fixes, and only one of them is the customer's.",
  );
}

check(
  "a refused control explains itself instead of being disabled",
  /copy\.notWired/.test(detail) && /\srole="status"/.test(detail),
  "Phase 8 settled this: a button that cannot be pressed cannot say why.",
);

check(
  "the summary panel is the cart's, imported rather than restated",
  /from "@\/features\/cart"/.test(detail) && /OrderSummary/.test(detail),
  "The design draws the same 415px panel on the order detail and the notifications page. A third copy is how the previous project ended up with seven pinks.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:orders"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} orders assertions passed\x1b[0m\n`);
