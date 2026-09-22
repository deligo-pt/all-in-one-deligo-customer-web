#!/usr/bin/env node
/**
 * Responsive pass guard — no page is wider than the screen, at any width.
 *
 * Measured on 22 Sep 2026 after the owner's manager got a horizontal scrollbar:
 * every route was loaded at every 16px from 320 to 1920 (and all public routes
 * at ten common widths), recording anything past the screen, anything spilling
 * out of its box, and anything scrolling sideways. Before: every page scrolled
 * sideways from 768 to 944px and from 1024 to 1366px — ordinary laptops — plus
 * 18–24px at 320px, and the home location card spilled at every phone width.
 * After: nothing, at any width.
 *
 * This file keeps the causes from coming back. Each rule is one of them:
 *
 * 1. **The header sheds items as it narrows.** It needed ~1,380px in
 *    containers of 1,120 and 1,312px, so it overflowed its own container at
 *    every width. It now drops items in a fixed order, each into the menu.
 * 2. **Page gutters shrink on phones.** 32px a side left 256px of content on a
 *    320px phone; 39 frames had it.
 * 3. **The location form answers to its card, not the screen**, because it
 *    lives in three cards of different widths.
 * 4. **Pickers wrap; they do not scroll.** The service tabs' sideways scrollbar
 *    was part of what was reported as "a horizontal bar".
 * 5. **Grid items and rows that hold text can shrink** (`min-w-0`, wrapping).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

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

/** The same character-walking stripper as the other guards: a rule about code
 *  must not be satisfied — or broken — by prose. */
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
      const quote = c;
      out += c;
      i += 1;
      while (i < src.length) {
        if (src[i] === "\\") {
          out += src.slice(i, i + 2);
          i += 2;
          continue;
        }
        out += src[i];
        if (src[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (c === "/" && REGEX_ALLOWED_BEFORE.test(out.trimEnd())) {
      out += c;
      i += 1;
      while (i < src.length && src[i] !== "\n") {
        if (src[i] === "\\") {
          out += src.slice(i, i + 2);
          i += 2;
          continue;
        }
        out += src[i];
        if (src[i] === "/") {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

const read = (f) => (existsSync(f) ? stripComments(readFileSync(f, "utf8")) : "");

const header = read(join(SRC, "components", "layout", "SiteHeader.tsx"));
const mobileNav = read(join(SRC, "components", "layout", "MobileNav.tsx"));
const locale = read(join(SRC, "components", "layout", "LocaleSwitcher.tsx"));
const footer = read(join(SRC, "components", "layout", "SiteFooter.tsx"));
const form = read(join(SRC, "components", "shared", "LocationForm.tsx"));
const picker = read(join(SRC, "app", "[locale]", "(marketing)", "_sections", "ServicePicker.tsx"));
const menuCard = read(join(SRC, "features", "food", "MenuItemCard.tsx"));
const plus = read(join(SRC, "app", "[locale]", "(marketing)", "_sections", "PlusPlans.tsx"));
const google = read(join(SRC, "features", "auth", "GoogleSlot.tsx"));

/** The app header's own markup: everything after the auth variant returns. */
const appBar = header.slice(header.indexOf('<header className="bg-surface border-line sticky'));

// ─────────────────────────────────────────────────────────────────────────────
section("§1  🔴 The header sheds items as it narrows");

check(
  "the link row appears only from xl, where it fits",
  /<nav aria-label=\{t\("mainNavigation"\)\} className="hidden xl:block">/.test(appBar),
  "at lg (1024px) the full bar needed ~1,380px — every page scrolled sideways on laptops",
);
check(
  "the menu button is there until the link row is",
  /className="xl:hidden"/.test(mobileNav),
  "the two must switch at the same width, or both show, or neither does",
);
check(
  "sign-in from sm, language from md, search from lg, Download App from 2xl",
  /<div className="hidden items-center gap-2 sm:flex">/.test(appBar) &&
    /<LocaleSwitcher compact className="hidden md:inline-flex" \/>/.test(appBar) &&
    /className="hidden lg:block lg:w-40"/.test(appBar) &&
    /<Button asChild className="hidden 2xl:inline-flex">/.test(appBar),
  "the order they leave in — see the table in SiteHeader",
);
check(
  "🔴 nothing in the bar grows back at 2xl",
  !/2xl:(gap-8|w-52|gap-6)/.test(appBar),
  "at 2xl the bar gains Download App and pays for it; widening the gaps or the search again put it 42–61px past its container",
);
check(
  "🔴 whatever the bar drops is in the menu",
  (() => {
    const drawer = appBar.slice(appBar.indexOf("<MobileNav"), appBar.indexOf("</MobileNav>"));
    return (
      // `\b`: `<SearchBox` also matches `<SearchBoxX` — the slip this
      // project's mutation runs have now caught three times.
      /<SearchBox\b/.test(drawer) &&
      /<SignInButton\b/.test(drawer) &&
      /<LocaleSwitcher \/>/.test(drawer) &&
      /t\("downloadApp"\)/.test(drawer)
    );
  })(),
  "before this pass a phone had no way to sign in from the header at all",
);
check(
  "the menu renders what it is given",
  /children\?: ReactNode/.test(mobileNav) && /\{children \? \(/.test(mobileNav),
);
check(
  "the language picker has a compact form, named in full for a screen reader",
  /compact \? option\.toUpperCase\(\) : t\(LANGUAGE_NAME_KEY\[option\]\)/.test(locale) &&
    /aria-label=\{compact \? t\(LANGUAGE_NAME_KEY\[option\]\) : undefined\}/.test(locale),
  "the full name was 116px and tipped the bar over its container",
);
check(
  "the bar is shorter and tighter where there is no design",
  /"mx-auto flex h-16 items-center gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:h-\[6\.875rem\] lg:gap-6 lg:px-8"/.test(appBar),
  "110px tall with 32px gaps is the 1440px design; on a phone it is a sixth of the screen",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 Page gutters shrink on phones");

const devOnly = DEV_ONLY_ROUTES.map((route) => route.replace(/^\//, ""));
const bareGutters = filesUnder(SRC)
  .filter((file) => !file.endsWith(join("ui", "Button.tsx")))
  .filter((file) => !devOnly.some((route) => file.includes(`${join("[locale]", route)}`)))
  .filter((file) => /(^|["` ])px-8(["` ]|$)/m.test(read(file)))
  .map(rel);
check(
  "no page frame keeps a 32px gutter on a phone",
  bareGutters.length === 0,
  `bare px-8 in: ${bareGutters.join(", ")} — write px-4 sm:px-8. At 320px, 32px a side leaves 256px and cards spill.`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  🔴 The location form answers to its card, and is laid out for a thumb");

check(
  "it is a container",
  /"@container flex w-full flex-col gap-2"/.test(form),
  "it lives in three cards of different widths; the screen's width says nothing about the card's",
);
check(
  "the row wraps until the card holds it on one line",
  /flex w-full flex-wrap items-center gap-x-2 gap-y-3 border p-3 @min-\[42rem\]:flex-nowrap/.test(form),
  "the one-line row needs ~670px; below that it spilled out of the hero card by 7–101px",
);
check(
  "🔴 narrow: field and locate icon, then saved addresses, then a full-width Explore",
  /order-1 min-w-0 flex-1 @min-\[42rem\]:order-none/.test(form) &&
    /order-2 inline-flex size-10/.test(form) &&
    /order-3 basis-full @min-\[42rem\]:order-none/.test(form) &&
    /order-4 shrink-0 basis-full @min-\[42rem\]:order-none/.test(form),
  "the owner's screenshot (22 Sep) had 'Saved addresses' alone on a line and Explore squeezed beside 'use current location'",
);
check(
  "the locate icon keeps its words for a screen reader, and shows them when there is room",
  /<span className="sr-only @min-\[42rem\]:not-sr-only">\{copy\.locateMe\}<\/span>/.test(form),
);
check(
  "a named container size is not used — this theme resets them",
  !/@(xs|sm|md|lg|xl|2xl|3xl):/.test(form),
  "`--container-*: initial` in globals.css; `@2xl:` would silently generate nothing",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  🔴 Pickers wrap; they do not scroll");

check(
  "🔴 the service tabs are a slider on a phone — with no scrollbar and no divider",
  /overflow-x-auto/.test(picker) &&
    /\[scrollbar-width:none\]/.test(picker) &&
    /\[&::-webkit-scrollbar\]:hidden/.test(picker) &&
    /snap-x snap-mandatory/.test(picker) &&
    /max-sm:\[mask-image:/.test(picker) &&
    /sm:border-b/.test(picker) &&
    !/"border-line flex[^"]* border-b /.test(picker),
  "the grey bar under the tabs — a scrollbar, then a divider — is what was reported as a horizontal bar",
);
check(
  "…and wrap from sm, where they fit",
  /sm:flex-wrap/.test(picker) && /sm:overflow-visible/.test(picker),
);
check(
  "choosing a tab slides it into view without moving the page",
  /scrollIntoView\(\{[\s\S]{0,80}block: "nearest"/.test(picker),
);
check(
  "the footer's last row wraps",
  /"text-14 flex flex-wrap items-center gap-x-4 gap-y-2"/.test(footer),
  "privacy, terms, language and currency are ~340px; the currency hung 23px off a 320px phone",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  Grid items and rows that hold text can shrink");

check(
  "the menu card can shrink, and its photo does on a phone",
  /flex min-w-0 gap-3/.test(menuCard) && /size-20 shrink-0 sm:size-28/.test(menuCard),
  "a 112px photo left 126px for name, badge, price and button at 320px",
);
check(
  "its price row wraps",
  /flex min-w-0 flex-wrap items-baseline/.test(menuCard),
);
check(
  "the Plus plan cards can shrink",
  (plus.match(/min-w-0/g) ?? []).length >= 2 &&
    (plus.match(/p-6 sm:p-8/g) ?? []).length === 2 &&
    /flex flex-wrap items-start justify-between gap-4/.test(plus),
);

check(
  "🔴 Google's button is redrawn when its slot changes width",
  /new ResizeObserver\(/.test(google) &&
    /observer\.observe\(slot\)/.test(google) &&
    /observer\?\.disconnect\(\)/.test(google) &&
    /Math\.max\(MIN_WIDTH, Math\.min\(/.test(google),
  "Google draws it at a fixed width, once: a page drawn wide and then narrowed kept a 400px button, 26px off a 320px screen (the last thing the full audit found)",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§7  🔴 Phone-first: rows swipe, nothing sticks at the desktop header height");

const slider = read(join(SRC, "lib", "phoneSlider.ts"));
const MARKETING = join(SRC, "app", "[locale]", "(marketing)", "_sections");
const services = read(join(MARKETING, "ExploreServices.tsx"));
const partner = read(join(MARKETING, "Partner.tsx"));
const hero = read(join(MARKETING, "Hero.tsx"));
const download = read(join(MARKETING, "DownloadApp.tsx"));
const cuisines = read(join(SRC, "features", "food", "CuisineRow.tsx"));
const menuNav = read(join(SRC, "features", "food", "MenuNav.tsx"));
const vendorMenu = read(join(SRC, "features", "food", "VendorMenu.tsx"));
const storeView = read(join(SRC, "features", "groceries", "StoreView.tsx"));

check(
  "one slider pattern, and it draws no scrollbar",
  /export const PHONE_SLIDER =/.test(slider) &&
    /export const PHONE_SLIDE =/.test(slider) &&
    /export const PHONE_STRIP =/.test(slider) &&
    (slider.match(/\[scrollbar-width:none\] \[&::-webkit-scrollbar\]:hidden/g) ?? []).length === 2,
  "the peeking next card is the affordance; a scrollbar was the complaint",
);
check(
  "🔴 the stacked card rows swipe on a phone",
  [services, partner].every(
    (file) => /PHONE_SLIDER\)/.test(file) && /className=\{PHONE_SLIDE\}/.test(file),
  ),
  "six service cards alone were 2,000px of scrolling; the landing page was 12,000px tall on a phone",
);
check(
  "the cuisine row and the store's category bar are one swipeable line",
  // Applied, not merely imported — an import alone passed the first version.
  /cn\([^)]*PHONE_STRIP, className\)/.test(cuisines) &&
    /PHONE_STRIP\)/.test(menuNav) &&
    /whitespace-nowrap/.test(menuNav),
  "wrapped, the categories were three or four rows of a sticky bar — a third of the screen",
);
const stuck = filesUnder(SRC)
  .map((file) => [rel(file), read(file)])
  .filter(([, code]) => /(?<![:\w-])top-\[6\.875rem\]/.test(code) || /(?<![:\w-])min-h-\[calc\(100vh-6\.875rem\)\]/.test(code))
  .map(([path]) => path);
check(
  "🔴 nothing sticks or sizes itself to the 110px header on a phone",
  stuck.length === 0,
  `unprefixed 110px offset in: ${stuck.join(", ")} — the header is 64px on a phone and 80px from sm, so a bare offset leaves a gap the page scrolls through`,
);
check(
  "the store's bar sticks at the header's height for each width",
  /sticky top-16 z-20[\s\S]{0,160}sm:top-20[\s\S]{0,60}lg:top-\[6\.875rem\]/.test(menuNav),
);
check(
  "…edge to edge on a phone, as wide as the strip inside it",
  /max-sm:-mx-4 max-sm:px-4/.test(menuNav),
  "a bar 16px short of the screen let the menu show through beside it while stuck",
);
check(
  "🔴 the menu's scroll-spy offset is measured, not assumed",
  !/-176px/.test(vendorMenu) &&
    /rootMargin: `-\$\{stickyBottom\}px 0px -60% 0px`/.test(vendorMenu) &&
    /setStickyBottom\(header\.offsetHeight \+ bar\.offsetHeight\)/.test(vendorMenu) &&
    /scroll-mt-\[var\(--dg-menu-offset\)\]/.test(vendorMenu),
  "a fixed 176px marked the wrong category and dropped a tapped heading under the bar on a phone",
);
check(
  "an empty cart panel is not a card at the bottom of a phone's scroll",
  [vendorMenu, storeView].every((file) => /\(!cart \|\| cart\.lines\.length === 0\) && "max-lg:hidden"/.test(file)),
);
check(
  "the hero is as tall as its content on a phone",
  /flex items-center overflow-hidden sm:min-h-\[52rem\]/.test(hero) && /text-32 text-ink-inverse sm:text-40 lg:text-56/.test(hero),
  "832px is the 1440px design; on a phone it was a screen of empty photograph",
);
check(
  "sections breathe less on a phone",
  !/(?<![:\w-])py-20(?![\w-])/.test([services, partner, download].join("\n")),
);
check(
  "the illustration phones are not drawn on a phone",
  /hidden h-\[30rem\] w-full max-w-md items-end justify-center sm:flex/.test(download),
);
check(
  "the footer's link lists sit two to a row",
  /grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5/.test(footer) && /col-span-2 flex flex-col gap-4 lg:col-span-1/.test(footer),
);
check(
  "the menu button is ☰, not ⌄",
  /<Icon name="menu" \/>/.test(mobileNav),
  "on a phone a chevron reads as 'expand this', not as the menu",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:responsive"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} responsive assertions passed\x1b[0m\n`);
