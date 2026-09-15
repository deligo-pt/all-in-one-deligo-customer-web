#!/usr/bin/env node
/**
 * Phase 12 guard — the account area. Rewritten in Phase 20, when it went live.
 *
 * Three writes here cannot be taken back from the page: removing a card,
 * removing an address, and a message to support. §2 is that each asks twice
 * or is sent only by the customer's own press. The account's deletion has **no
 * customer endpoint**, and the old app faked its success — §2 forbids that.
 *
 * §4 is the other risk this area always had: invention. The prose pages carry
 * the owner's copy carried over from the old app, or say they are pending.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FEATURE = join(SRC, "features", "account");
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
const transport = read(join(FEATURE, "api.ts"));
const listView = read(join(FEATURE, "AccountListView.tsx"));
const addressesView = read(join(FEATURE, "AddressesView.tsx"));
const addressForm = read(join(FEATURE, "AddressFormModal.tsx"));
const supportView = read(join(FEATURE, "SupportView.tsx"));
const profile = read(join(FEATURE, "ProfileView.tsx"));
const nav = read(join(SRC, "components", "layout", "accountNav.ts"));
const serverRead = read(join(SRC, "services", "account", "server.ts"));
const contentRead = read(join(SRC, "services", "content", "server.ts"));
const settingsPage = read(join(APP, "(account)", "account", "settings", "page.tsx"));
const statesPage = read(join(APP, "account-states", "page.tsx"));
const fixturePath = join(APP, "account-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The account holds nothing it has no business holding");

check(
  "a saved card is a label and an expiry, never a number",
  !/\bcardNumber\b|\bcvv\b|cc-number|autoComplete="cc-/i.test(
    featureFiles.map((f) => code.get(f)).join("\n"),
  ),
  "D-14: card details belong to the payment provider.",
);

check(
  "the account id is the API's, rendered and never generated",
  /accountId: raw\.userId/.test(serverRead) &&
    /profile\.accountId/.test(profile) &&
    !/Math\.random/.test(profile),
  "It is what `PATCH /customers/:id` takes; a made-up one edits nobody, or somebody else.",
);

const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|amount|total|earned|balance|wallet)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const calculators = [
  ...featureFiles,
  join(SRC, "services", "account", "server.ts"),
].filter((f) =>
  (code.get(f) ?? "")
    .split("\n")
    .some((l) => CONVERSION.test(l) || (MONEY_WORD.test(l) && OPERATOR.test(l))),
);
check(
  "nothing computes or converts a money value",
  calculators.length === 0,
  `Referral earnings and the wallet are the API's.\n      ${calculators.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 What cannot be taken back is asked twice, or never faked");

const WRITES = [
  "updateProfile",
  "upload",
  "sendContactCode",
  "confirmContact",
  "addAddress",
  "updateAddress",
  "removeAddress",
  "activateAddress",
  "removeCard",
  "sendSupport",
  "markSupportRead",
];
const missing = WRITES.filter(
  (m) =>
    !new RegExp(`\\b${m}\\(`).test(types) ||
    !new RegExp(`async ${m}\\(`).test(transport),
);
check(
  `the contract names every write and the client implements each (${WRITES.length})`,
  missing.length === 0 &&
    /import\("@\/services\/session\/browser"\)/.test(transport) &&
    !/from\s+"axios"|from\s+"@\/services\/session\/browser"/.test(transport),
  `One implementation, the session client loaded on use (Phase 15).\n      ${missing.join(", ")}`,
);

const updateBody = transport.slice(
  transport.indexOf("async updateProfile"),
  transport.indexOf("async upload"),
);
check(
  "the profile update sends only what `PATCH /customers/:id` accepts; email and phone change by code",
  /name:/.test(updateBody) &&
    /NIF:/.test(updateBody) &&
    /profilePhoto:/.test(updateBody) &&
    !/email|contactNumber/.test(updateBody) &&
    /"\/profile\/send-otp"/.test(transport) &&
    /"\/profile\/update-email-or-contact-number"/.test(transport),
  "Measured: the schema refuses `email` and `contactNumber` by name. A change of either is only real once the code sent to the new one comes back.",
);

check(
  "🔴 removing a card or an address asks twice",
  [listView, addressesView].every(
    (s) =>
      /confirming === (row|address)\.id \?/.test(s) &&
      /setConfirming\((row|address)\.id\)/.test(s),
  ),
  "Neither can be restored from here. The first press arms, the second sends.",
);

check(
  "an address is placed on the map before it is saved, or not saved",
  /geocodeAddress\(/.test(addressForm) &&
    /if \(!place\) \{[\s\S]{0,120}?return;/.test(addressForm) &&
    addressForm.indexOf("if (!place)") < addressForm.indexOf("accountApi.addAddress"),
  "The API needs coordinates, and the active address is where orders are delivered and restaurants are searched from. Latitude 0 is the Gulf of Guinea.",
);

check(
  "🔴 account deletion is never faked: it is a support request the customer sends",
  /ROUTES\.support\.path/.test(settingsPage) &&
    /deleteRequestMessage/.test(settingsPage) &&
    ![...code.values()].some((s) =>
      /delete-account|customers\/delete(?![-\w])|deleteAccount\(/.test(s),
    ) &&
    /initialMessage/.test(supportView) &&
    !/useEffect\([^)]*sendSupport/.test(supportView) &&
    /onClick=\{send\}/.test(supportView),
  "The API has no customer deletion endpoint, and the old app showed success after calling nothing. The request is written for the customer and sent only by their own press.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The design's sample account cannot reach a customer, or the API");

check("the fixture exists", existsSync(fixturePath), `Expected ${rel(fixturePath)}.`);
const importedPaths = (file, s) =>
  [...s.matchAll(/\bfrom\s*["'](\.[^"']*)["']/g)]
    .map((m) => resolve(dirname(file), m[1]))
    .map((t) => (/\.tsx?$/.test(t) ? t : `${t}.ts`));
const importers = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([f, s]) => importedPaths(f, s).includes(fixturePath))
  .map(([f]) => rel(f));
check(
  `only the development states page imports the fixture (${importers.length})`,
  importers.every((f) => f.includes(`account-states${sep}page.tsx`)),
  `"Jane Cooper" is a picture of the design.\n      ${importers.join("\n      ")}`,
);

check(
  "the states page is development-only and sends nothing",
  DEV_ONLY_ROUTES.includes("account-states") &&
    (statesPage.match(/offlineNotice=\{offline\}/g) ?? []).length >= 4 &&
    [listView, addressesView, supportView, profile].every((s) =>
      /if \(offlineNotice\)/.test(s),
    ),
  "The views are live: without the offline notice the states page would edit, remove and message with a fixture's ids.",
);

check(
  "the dialogs load on use",
  (profile.match(/dynamic\(/g) ?? []).length >= 2 && /dynamic\(/.test(addressesView),
  "Most visits to the profile edit nothing.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The prose pages carry the owner's copy, or say they are pending");

const withDocument = ["privacy", "terms", "faqs", "about", "help", "contact"];
const pending = [
  "careers",
  "blog",
  "press",
  "our-story",
  join("help", "delivery"),
  join("help", "returns"),
];
const marketing = (page) => read(join(APP, "(marketing)", page, "page.tsx"));
check(
  `six pages render the carried-over copy and six say they are pending (${withDocument.length}+${pending.length})`,
  withDocument.every((p) => new RegExp(`readContent\\("${p}"\\)`).test(marketing(p))) &&
    pending.every(
      (p) =>
        /<ContentPage\b/.test(marketing(p)) &&
        !/readContent|document=/.test(marketing(p)),
    ),
  "D-16: a privacy policy, terms or a company description is the owner's. The old app's published copy is that; for the rest nothing exists, and inventing it is not ours to do.",
);

check(
  "the carried-over copy is in its own namespace, in both languages, and names where it came from",
  /getTranslations\("content"\)/.test(contentRead) &&
    ["en", "pt"].every((l) =>
      existsSync(join(SRC, "i18n", "dictionaries", l, "content.ts")),
    ) &&
    /old app/.test(
      readFileSync(join(SRC, "i18n", "dictionaries", "en", "content.ts"), "utf8"),
    ),
  "Whoever changes a sentence in the terms needs to know it is published copy, not a placeholder.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The structural decisions, asserted");

check(
  "the account menu is built from the route map, and includes support",
  /ROUTES\./.test(nav) && !/href: "\//.test(nav) && /ROUTES\.support\.path/.test(nav),
  "A hand-written path loses its locale prefix or rots when a route moves.",
);

check(
  "the support thread re-reads itself while open, and the page never scrolls for it",
  /setInterval\(\(\) => router\.refresh\(\), THREAD_REFRESH_MS\)/.test(supportView) &&
    !/scrollIntoView/.test(supportView),
  "Replies arrive from an agent while the customer waits; scrolling the whole page to them throws the reader off the thread.",
);

check(
  "a list tells 'nothing saved' apart from 'could not load'",
  /copy\.unavailableTitle/.test(listView) &&
    /copy\.emptyTitle/.test(listView) &&
    /copy\.unavailableTitle/.test(addressesView) &&
    /copy\.emptyTitle/.test(addressesView),
  "Different sentences, different fixes.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:account"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} account assertions passed\x1b[0m\n`);
