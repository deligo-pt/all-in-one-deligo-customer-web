#!/usr/bin/env node
/**
 * Phase 12 guard — the account area.
 *
 * The design draws **one** account screen. Its menu points at five pages that
 * exist only as 412px mobile frames or not at all, and at twelve help, legal
 * and company pages that exist nowhere (D-16). So the danger in this phase is
 * not a wrong number — it is **invention**: a privacy policy, a set of terms,
 * or a settings screen full of toggles nobody specified.
 *
 * §3 is that assertion. §2 is the ordinary one: `deleteAccount`,
 * `removeAddress` and `removeCard` must all reject, because each is
 * irreversible and a stub that resolved would report it done.
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
const transport = read(join(FEATURE, "transport.ts"));
const listView = read(join(FEATURE, "AccountListView.tsx"));
const profile = read(join(FEATURE, "ProfileView.tsx"));
const nav = read(join(FEATURE, "nav.ts"));
const barrel = read(join(FEATURE, "index.ts"));
const contentPage = read(join(SRC, "components", "shared", "ContentPage.tsx"));
const fixturePath = join(APP, "account-states", "fixture.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The account holds no secret it has no business holding");

check(
  "a saved card is a label and an expiry, never a number",
  /label: string/.test(types) &&
    !/(?:pan|cardNumber|cvv|cvc|securityCode)/i.test(types),
  "A brand and four digits are all a customer needs to tell two cards apart, and all this application is entitled to hold. Card details belong to the payment provider (D-14).",
);

check(
  "the account id is rendered, never generated",
  /accountId: string/.test(types) && !/Math\.random|uuid/i.test(profile),
  "It identifies the customer to support. A frontend that made one up would be inventing an identity.",
);

const CONVERSION = /\.toFixed\s*\(|\bparseFloat\s*\(|\bNumber\s*\(/;
const MONEY_WORD = /\b(?:price|subtotal|amount|total|charge|discount|fee|earned)\b/i;
const OPERATOR = /\s[-+*/]\s*[\w(.]/;
const offending = (s) =>
  s
    .split("\n")
    .filter((l) => CONVERSION.test(l) || (MONEY_WORD.test(l) && OPERATOR.test(l)));
const scope = [...featureFiles, fixturePath].filter(existsSync);
const calculators = scope.filter((f) => offending(code.get(f) ?? read(f)).length > 0);
check(
  `nothing computes or converts a money value (${scope.length} files)`,
  calculators.length === 0,
  `What a referral has earned is the backend's sum.\n      ${calculators.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 Nothing can be deleted");

const rejects = (transport.match(/Promise\.reject\(/g) ?? []).length;
check(
  `every method of the shipped transport fails (${rejects}/9 reject)`,
  rejects >= 9,
  "`deleteAccount` is irreversible and `removeAddress` and `removeCard` are the same in miniature. A stub that resolved would tell a customer their account was gone when it was not.",
);

const NETWORK = /\bfetch\s*\(|\baxios\b|XMLHttpRequest/;
const callers = featureFiles.filter((f) => NETWORK.test(code.get(f) ?? ""));
check(
  "no file in the feature makes a network call",
  callers.length === 0,
  `Phase 20 connects these.\n      ${callers.map(rel).join("\n      ")}`,
);

check(
  "a removal goes through the transport, never a local splice",
  /await onRemove\(/.test(listView) && !/\.filter\(\(r\) => r\.id !== /.test(listView),
  "Removing a card or an address cannot be undone. A local splice that *looked* like it worked would be the worst possible version.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  🔴 Nothing is invented where the design is silent");

check(
  "the twelve prose pages share one shell and none carries a document",
  /pendingTitle/.test(contentPage) &&
    !/Privacy Policy|We collect|hereby|Last updated/i.test(contentPage),
  "Terms and a privacy policy are legal documents; an 'About DeliGo' is a claim about a company. The shell is real and says the content is pending — which is a different sentence from 'not built', and the true one.",
);

// Rendered, not merely mentioned. Matching the *word* `ContentPage` also
// matches an import that has been replaced by a local stub, and a comment
// naming the component — neither of which puts the shell on the page.
const prose = filesUnder(join(APP, "(marketing)")).filter((f) =>
  /<ContentPage\b/.test(code.get(f) ?? ""),
);
check(
  `every prose page uses that shell (${prose.length} pages)`,
  prose.length >= 12,
  "Twelve pages with twelve invented layouts is twelve places for a legal document to be styled differently.",
);

check(
  "the settings page ships the destructive action rather than invented toggles",
  /deleteAccount/.test(read(join(APP, "(account)", "account", "settings", "page.tsx"))),
  "The design has no settings screen. What it does have is the one thing this page must not get wrong; a list of switches nobody specified is the alternative.",
);

check(
  "the account menu is built from the route map, not typed out",
  /ROUTES\./.test(nav) && !/href: "\//.test(nav),
  "A hand-written path loses its locale prefix, and one that is right today is the one missed when a route moves.",
);

check(
  "one list view serves addresses, cards and vouchers",
  existsSync(join(FEATURE, "AccountListView.tsx")) &&
    !existsSync(join(FEATURE, "AddressList.tsx")) &&
    !existsSync(join(FEATURE, "CardList.tsx")),
  "All three are the same shape in the design's mobile frames. Three near-identical components is three places for the empty state and the refusal to drift apart — how seven pinks started.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The sample account cannot reach a customer");

check("the fixture exists", existsSync(fixturePath), `Expected ${rel(fixturePath)}.`);

const importedPaths = (file, s) =>
  [...s.matchAll(/\bfrom\s*["'](\.[^"']*)["']/g)]
    .map((m) => resolve(dirname(file), m[1]))
    .map((t) => (/\.tsx?$/.test(t) ? t : `${t}.ts`));
const importers = [...code]
  .filter(([f]) => f !== fixturePath)
  .filter(([f, s]) => importedPaths(f, s).includes(fixturePath))
  .map(([f]) => rel(f));
const stray = importers.filter((f) => !f.includes(`account-states${sep}page.tsx`));
check(
  `only the development states page imports the fixture (${importers.length})`,
  stray.length === 0,
  `"Jane Cooper" and "DG-20458931" are a picture of the design.\n      ${stray.join("\n      ")}`,
);

check(
  "the states page is on the development-only list",
  DEV_ONLY_ROUTES.includes("account-states"),
  "`verify:shell` asserts it 404s in production.",
);

const appCode = filesUnder(join(SRC, "app"))
  .map((f) => code.get(f) ?? "")
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
const unused = exported.filter((n) => !new RegExp(`\\b${n}\\b`).test(appCode));
check(
  `every value the barrel exports is rendered by a route (${exported.length} exports)`,
  unused.length === 0,
  `An export nobody renders is bytes on somebody's route — 27 KB, 9.3 KB and 11 KB in Phases 6 and 8.\n      ${unused.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The screens say which nothing they are showing");

check(
  "the list tells 'nothing saved' apart from 'not connected'",
  /copy\.unavailableTitle/.test(listView) && /copy\.emptyTitle/.test(listView),
  "Different sentences, different fixes, and only one of them is the customer's.",
);

check(
  "a refused control explains itself instead of being disabled",
  /copy\.notWired/.test(listView) && /\srole="status"/.test(listView),
  "Phase 8 settled this.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:account"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} account assertions passed\x1b[0m\n`);
