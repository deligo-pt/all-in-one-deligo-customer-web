#!/usr/bin/env node
/**
 * Phase 20d guard — the store's hours, its details, and a rail that follows.
 *
 * Three things the old app told a customer about a store and this one did not:
 * how long they have left to order, when the store is open and how to reach
 * it, and which part of the menu they are looking at. Each has a way of going
 * quietly wrong — a countdown rendered on the server is stale before it
 * arrives, a details dialog invents "not provided" for fields the API never
 * sent, and a rail whose active item is hard-coded lies on every scroll.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
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

const panel = read(join(SRC, "features", "food", "StoreDetailsPanel.tsx"));
const detailsModal = read(join(SRC, "features", "food", "StoreDetailsModal.tsx"));
const maps = read(join(SRC, "services", "maps", "browser.ts"));
const menu = read(join(SRC, "features", "food", "VendorMenu.tsx"));
const intro = read(join(SRC, "features", "food", "VendorIntro.tsx"));
const hours = read(join(SRC, "lib", "pickup.ts"));
const catalog = read(join(SRC, "services", "catalog", "food.ts"));
const vendorPage = read(join(SHOP, "vendors", "[vendorId]", "page.tsx"));

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a71  The countdown is the store's clock, not the server's");

check(
  "closing is read in the store's time zone",
  /STORE_TIME_ZONE = "Europe\/Lisbon"/.test(hours) &&
    /export function msUntilClosing/.test(hours),
  "A customer in London must be told the minutes the kitchen has, not the minutes their own clock has.",
);

check(
  "four states answer null rather than zero",
  /if \(!open\) return null;/.test(hours) &&
    /if \(!closing\) return null;/.test(hours) &&
    /if \(closed\.has\(weekday\(today\)\)\) return null;/.test(hours) &&
    /remaining > 0 \? remaining : null/.test(hours),
  "Shut, a closing day, unreadable hours and already past closing are not 00:00 — a countdown at zero tells the customer to hurry into a closed shop.",
);

check(
  "nothing is counted down on the server",
  /"use client"/.test(panel) && /useState<number \| null>\(null\)/.test(panel),
  "A figure rendered on the server is already stale when it reaches the reader, and differs from what their own clock says a second later.",
);

check(
  "each tick recomputes from the clock instead of subtracting",
  /const tick = \(\) => \{[\s\S]{0,240}msUntilClosing\(/.test(panel) &&
    /setInterval\(tick, 1000\)/.test(panel),
  "A decremented counter drifts, and a backgrounded tab throttles the interval — recomputing corrects itself.",
);

check(
  "the countdown appears only inside the final hour",
  /WINDOW_MS = 60 \* 60 \* 1000/.test(panel) && /ms <= WINDOW_MS/.test(panel),
  'Before that, "Open until 22:30" already says everything worth saying.',
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a72  The dialog says only what the API said");

check(
  "a field the API did not send is left out, not filled in",
  /\.filter\(\(row\) => row !== null\)/.test(detailsModal),
  'The old app printed "not provided" six times at a customer who did not ask.',
);

check(
  "the store's position is drawn as a real map, with a pin on it",
  /mountStoreMap\(/.test(detailsModal) && /new Marker\(/.test(maps),
  "A picture of a map cannot answer \u201cwhich side of the street\u201d, which is the question a customer opens this dialog with.",
);

check(
  "the map mounts from a callback ref, not an effect over a `useRef`",
  /useState<HTMLDivElement \| null>\(null\)/.test(detailsModal) &&
    /ref=\{setMapFrame\}/.test(detailsModal),
  "Measured: inside the dialog the effect ran while `ref.current` was still null, so the map silently never loaded and nothing errored.",
);

check(
  "a store with no coordinates gets no frame at all",
  /\{position \? \(/.test(detailsModal),
  "An empty grey rectangle over the Atlantic is worse than no map.",
);

check(
  "a map that fails to load leaves the rest of the dialog standing",
  /setMapFailed\(true\)/.test(detailsModal) &&
    /copy\.mapUnavailable/.test(detailsModal),
  "The address, the hours and the telephone are still the answer to \u201cwhere are they\u201d.",
);

check(
  "the partner's EU compliance line is carried over from the old dialog",
  /copy\.euCompliance/.test(detailsModal),
  "It is a statement the partner makes about their products, not something we compute.",
);

check(
  "the dialog loads on the press, not with the page",
  /dynamic\(\(\) =>\s*import\("\.\/StoreDetailsModal"\)/.test(panel) &&
    !/@\/components\/ui\/Modal/.test(panel) &&
    /@\/components\/ui\/Modal/.test(detailsModal),
  "Statically imported, Radix's dialog put the vendor and grocery-store routes at 195.6 KB of a 200 KB budget for a dialog nobody had opened.",
);

check(
  "the details are mapped from the store's own record",
  /preparationTimeMinutes/.test(catalog) &&
    /businessLocation/.test(catalog) &&
    /contactNumber/.test(catalog),
  "Hours, days off, preparation time, address and contacts all exist on `/vendors/nearby/open/:id` (measured); none of them is invented here.",
);

check(
  "the API's English day names are translated, and an unknown one survives",
  /dayNames\(context\)\[day\.trim\(\)\.toLowerCase\(\)\] \?\? day/.test(catalog) &&
    /monday: t\("dayMonday"\)/.test(catalog),
  'The API sends "Friday". A day we cannot translate is still a day the store is closed — and the keys are spelled out, because a key nobody writes is one `verify:i18n` calls unused.',
);

check(
  "no function crosses into the client component",
  !/orderWithin: \(/.test(vendorPage) && /orderWithin: string;/.test(panel),
  "React refuses a function prop on a client component; the sentence crosses with its slot intact and is filled where the clock is.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a73  The rail follows the page");

check(
  "the active category is observed, not assumed",
  /new IntersectionObserver\(/.test(menu) &&
    /activeId=\{active \?\? categories\[0\]\?\.id\}/.test(menu),
  'It used to mark the first category for ever, so it said "Starters" at the bottom of the desserts.',
);

check(
  "the observer allows for the sticky bar",
  /rootMargin: "-176px/.test(menu),
  "Without it the section hidden behind the search-and-rail bar counts as the one being read.",
);

check(
  "the sections carry the ids the observer reads",
  /data-category=\{category\.id\}/.test(menu),
  "An observer with nothing to observe silently never fires.",
);

check(
  "the links stay anchors",
  /href=\{`#menu-\$\{category\.id\}`\}/.test(
    read(join(SRC, "features", "food", "MenuNav.tsx")),
  ),
  "Scrolling is the browser's job; script that hijacks it breaks opening in a new tab and the back button.",
);

check(
  "the panel is rendered through the intro, not bolted onto the page",
  /storeDetails\?: ReactNode;/.test(intro) && /<StoreDetailsPanel/.test(menu),
  "The states page renders the same intro without a dialog; a hard dependency there would make an offline screen reach for a store record.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a74  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:vendor"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m\u2717 ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m\u2713 ${passed}/${passed} vendor assertions passed\x1b[0m\n`);
