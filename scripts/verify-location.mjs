#!/usr/bin/env node
/**
 * Phase 20b guard — the location picker on the delivery card.
 *
 * The old app changed the delivery address from the navbar. Here the card the
 * design already draws above every listing owns it, which is where the
 * customer is looking when they notice the address is wrong. These rules keep
 * that true in the three ways it can quietly stop being true: the card's
 * "Change" going back to being a link to nowhere useful, the write going
 * somewhere other than the API's own toggle, and the dialog being pulled into
 * the listing's first load where nobody has opened it yet.
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

const modal = read(join(SRC, "components", "shared", "LocationModal.tsx"));
const form = read(join(SRC, "components", "shared", "LocationForm.tsx"));
const bar = read(join(SRC, "features", "food", "DeliveryBar.tsx"));
const vendorListing = read(join(SRC, "features", "food", "VendorListing.tsx"));
const groceryListing = read(join(SRC, "features", "groceries", "GroceryListing.tsx"));
const serverRead = read(join(SRC, "services", "location", "server.ts"));
const browserWrite = read(join(SRC, "services", "location", "browser.ts"));
const addressForm = read(join(SRC, "features", "account", "AddressFormModal.tsx"));
const maps = read(join(SRC, "services", "maps", "browser.ts"));
const restaurantsPage = read(join(SHOP, "food", "restaurants", "page.tsx"));
const storesPage = read(join(SHOP, "groceries", "stores", "page.tsx"));

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a71  The card owns the change");

check(
  "the delivery card can open the picker instead of navigating",
  /onChange\s*\?/.test(bar) && /<button\b[\s\S]*onClick=\{onChange\}/.test(bar),
  "The old app's navbar picker is not being rebuilt; the card the design draws is the one place this happens.",
);

for (const [name, listing] of [
  ["the restaurant listing", vendorListing],
  ["the store listing", groceryListing],
]) {
  check(
    `${name} passes the card an opener and mounts the picker`,
    /onChange=\{locationCopy \? \(\) => setPicking\(true\) : undefined\}/.test(
      listing,
    ) && /<LocationModal\b/.test(listing),
    "Without both, the card's Change is a link back to the hero and the picker is unreachable.",
  );

  check(
    `${name} loads the picker on the press, not with the page`,
    /dynamic\(\(\) =>\s*import\("@\/components\/shared\/LocationModal"\)/.test(listing),
    "A static import puts Radix, the address bar and the geocoder into a listing nobody has clicked. Measured: 194.9 KB against a 200 KB budget, back to 180.9 KB lazily.",
  );

  check(
    `${name} hands the picker the saved addresses`,
    /choices=\{choices\}/.test(listing),
    "A picker with no saved addresses is only the guest half of the dialog.",
  );
}

for (const [name, page] of [
  ["/food/restaurants", restaurantsPage],
  ["/groceries/stores", storesPage],
]) {
  check(
    `${name} reads the location and the choices in one call`,
    /getDeliveryContext\(\)/.test(page) && !/getDeliveryLocation\(\)/.test(page),
    "Two reads of `/profile` to answer two halves of one question is a second round trip for nothing.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a72  The writes are the API's own");

check(
  "switching the address is the API's toggle, through the one client",
  /customers\/toggle-delivery-address-status\//.test(browserWrite) &&
    /browserApi\(\)\.patch\(/.test(browserWrite) &&
    /import\("@\/services\/session\/browser"\)/.test(browserWrite),
  "The active address is account-wide and is what `/checkout` binds to. Nothing here may keep a second, listing-only idea of it.",
);

check(
  "the guest's location is stored by our own route handler",
  /fetch\("\/api\/location"/.test(browserWrite),
  "A guest has no account to write to; the cookie is set same-origin by `/api/location`.",
);

check(
  "the picker and the address bar write through the service, never directly",
  !/\bfetch\(/.test(modal) &&
    !/\bfetch\(/.test(form) &&
    /import\("@\/services\/location\/browser"\)/.test(modal) &&
    /import\("@\/services\/location\/browser"\)/.test(form),
  "§3.3: a component that fetches is a component that has its own idea of the API.",
);

check(
  "the server read names the active address, not the first one",
  /address\.isActive/.test(serverRead) && /find\(/.test(serverRead),
  "The first address in the list is whichever one was added first, which is not where the order goes.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a73  It asks once, and only when it has nothing");

check(
  "the first-visit ask is written before the dialog opens",
  /setItem\(ASKED, "1"\)[\s\S]{0,120}onOpenChange\(true\)/.test(modal),
  "Opening first and recording afterwards asks again on the next page when the customer closes it.",
);

check(
  "storage that throws asks nothing, rather than asking every time",
  /catch\s*\{[\s\S]{0,200}return;/.test(modal),
  "A private window must not turn a once-per-browser prompt into a prompt on every page load.",
);

check(
  "the ask only happens with no location at all",
  /if \(!askOnce \|\| !unset\) return;/.test(modal),
  "A customer who has an address has already answered the question.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a74  The pin is the precise part");

check(
  "the map is the one that moves, under a pin the frame draws",
  /pointer-events-none[\s\S]{0,120}<Icon name="location"/.test(addressForm) &&
    /"idle"/.test(maps),
  "A draggable marker needs the marker library and a map id; the centre pin needs neither and works the same under a finger.",
);

check(
  "a moved pin wins over the geocoder for that save",
  /const place =\s*pinned \?\?/.test(addressForm),
  "A geocoded street is a building's centroid. The customer who moved the pin knows better, and the rider is sent to the pin.",
);

check(
  '"use my current location" takes the lead back from the pin',
  /setPinned\(null\);/.test(addressForm),
  "The device's position is a newer statement of where they are than a pin left over from before.",
);

check(
  "a map that cannot load leaves the form working",
  /catch \(error\) \{[\s\S]{0,240}console\.error\("\[address\] the map could not be loaded"/.test(
    addressForm,
  ),
  "No key, a blocked script or an offline device must not stop an address being saved on its geocoded street.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a76  The app remembers where the customer is (Phase 20n)");

const picker = read(join(APP, "(marketing)", "_sections", "ServicePicker.tsx"));
const heroSection = read(join(APP, "(marketing)", "_sections", "Hero.tsx"));
const foodDoor = read(join(SHOP, "food", "page.tsx"));
const groceryDoor = read(join(SHOP, "groceries", "page.tsx"));

check(
  "the landing card's field is the real one",
  /<LocationForm/.test(picker) && !/<Input/.test(picker),
  "It was a plain input wired to nothing, \u201cUse current location\u201d was a `<span>`, and Explore was a link \u2014 a customer typed their address, pressed Explore, and the front door asked for it again.",
);

check(
  "the landing card starts from the address we hold",
  /getDeliveryContext\(\)/.test(heroSection) &&
    /known=\{delivery\.location\?\.label/.test(heroSection),
  "A customer with an active delivery address was shown an empty \u201cWhere should we deliver?\u201d, as if the app had never met them.",
);

check(
  "an unchanged address is not sent to the geocoder again",
  /if \(settled && query === settled\.trim\(\)\)/.test(form),
  "The place is already placed; asking Google to find it again is a round trip to learn what we were told. Measured: Explore with a known address makes zero geocode requests.",
);

check(
  "the customer's own addresses are offered where they are asked",
  /saved\.length > 0 && copy\.savedLabel/.test(form) &&
    /activateAddress\(chosen\.id\)/.test(form) &&
    /saved=\{delivery\.choices\}/.test(heroSection) &&
    // Behind `dynamic()`: Radix's Select inside the form put the landing page
    // at 207.7 KB of a 200 KB budget, paid for by guests who have no saved
    // addresses at all.
    /dynamic\(\(\) =>\s*import\("@\/components\/shared\/SavedAddressPicker"\)/.test(
      form,
    ),
  "A customer with three saved addresses was being asked to type one of them. Choosing one makes it active account-wide — the same write the listing's picker makes — so the next page already agrees with it.",
);

check(
  "the field takes the width the card leaves it",
  /min-w-0 flex-1/.test(form) && /fill$/m.test(picker),
  'The icon variant of `Input` wraps itself in a `relative` div, which in a flex row sizes to its content: a long address was cut off at "Dhaka, Bang…" while half the card sat empty.',
);

check(
  "a saved address chosen in the field costs no geocode either",
  /setSettled\(chosen\.line\)/.test(form) && /query === settled\.trim\(\)/.test(form),
  "It is already placed; Explore should not send it to Google to be placed again.",
);

check(
  "a customer we can place is shown the results, not asked",
  /if \(placed\) redirect\(/.test(foodDoor) &&
    /if \(placed\) redirect\(/.test(groceryDoor),
  "The listing carries the address picker on its delivery card, so the front door is a door and not a gate.",
);

check(
  "the redirect reads a named value, not the browser's `location`",
  !/if \(location\) redirect\(/.test(foodDoor + groceryDoor),
  "`location` in a server component resolves to the DOM global, which is always truthy \u2014 the redirect would fire for everyone, including a customer with nowhere to deliver.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a75  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:location"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m\u2717 ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m\u2713 ${passed}/${passed} location assertions passed\x1b[0m\n`);
