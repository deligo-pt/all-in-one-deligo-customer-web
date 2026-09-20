#!/usr/bin/env node
/**
 * Phase 20c guard — search parity: places, sort and the filters.
 *
 * The old app's search shipped a filter rail whose controls the API ignored,
 * and no places section at all — the index holds food items only. Here every
 * control is a parameter `GET /search` honours, measured; places come from the
 * nearby-vendors list, which does match a business name; and nothing is sorted
 * or filtered after the API answers. These rules keep all three true.
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

const filters = read(join(SRC, "features", "search", "SearchFilterBar.tsx"));
const results = read(join(SRC, "features", "search", "SearchResults.tsx"));
const service = read(join(SRC, "services", "catalog", "search.ts"));
const foodCatalog = read(join(SRC, "services", "catalog", "food.ts"));
const groceryCatalog = read(join(SRC, "services", "catalog", "groceries.ts"));
const page = read(join(SHOP, "search", "page.tsx"));

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a71  Only the sorts the API has");

check(
  "price and rating are the sorts, and distance is not among them",
  /"price-asc":\s*\{ sortBy: "price", sortOrder: "asc" \}/.test(service) &&
    /"rating-desc":\s*\{ sortBy: "rating", sortOrder: "desc" \}/.test(service) &&
    !/sortBy: "distance"/.test(service),
  "`GET /search` sorts on price and rating only (measured). A distance option would be a control that changes nothing; it belongs in the Phase 21 spec.",
);

check(
  "a direction is always sent with a field",
  !/sortBy: "(price|rating)"(?!,\s*sortOrder)/.test(service),
  'The server default is descending for both, so "sort by price" would answer with the \u20ac100 burger first.',
);

check(
  "the sort in the URL is validated before it is used",
  /in SEARCH_SORTS/.test(service) && /isSearchSort\(query\.sort\)/.test(page),
  "An unknown `?sort=` must fall back to relevance, not be forwarded to the API.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a72  The filters are the URL, and the server applies them");

check(
  "the filter bar is a GET form, not a client component",
  /method="get"/.test(filters) &&
    !/"use client"/.test(filters) &&
    !/useState/.test(filters),
  "Filters in the URL survive a reload, a share and the back button — and a form needs no JavaScript to put them there.",
);

check(
  "the results page stays a server component",
  !/"use client"/.test(page),
  "The whole point of URL filters is that the server answers with them already applied.",
);

check(
  "a price that is not a finite number never reaches the API",
  /Number\.isFinite\(parsed\) && parsed >= 0/.test(page),
  "`minPrice=abc` answers HTTP 500 with the raw search-engine error.",
);

check(
  "every filter the page accepts is forwarded to the API",
  /cuisine: query\.cuisine/.test(service) &&
    /minPrice: query\.minPrice/.test(service) &&
    /maxPrice: query\.maxPrice/.test(service) &&
    /isHalal: true/.test(service),
  "A control the request drops is a control that lies.",
);

check(
  "paging keeps the filters",
  /const link = \(p: number\) => \{[\s\S]{0,600}params\.set\("cuisine", cuisine\)/.test(
    page,
  ),
  "Page 2 of a filtered search must be the same search.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a73  Places are real places");

check(
  "a name search reaches the vendors endpoint, for both verticals",
  /searchTerm: term/.test(foodCatalog) && /searchTerm: term/.test(groceryCatalog),
  "The search index holds food items only — there are no store documents to match, which is why the old app had no places section.",
);

check(
  "places need a location, and are absent without one",
  /if \(location\) places = matched;/.test(page),
  "`/vendors/nearby/open` is a proximity list first. With nowhere to be near, the section is absent rather than empty.",
);

check(
  "a failed place list does not fail the search",
  /restaurants\.status === "fulfilled"/.test(page) && /allSettled/.test(page),
  "Dishes are the search; places are an extra section.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a74  Nothing is re-ranked here");

check(
  "the view never sorts or drops results",
  !/results\.(sort|filter)\(/.test(results) && !/hits\.(sort|filter)\(/.test(service),
  "\u00a72.2: the API decides what comes back and in what order. A client-side sort is a second, disagreeing idea of relevance.",
);

check(
  "the total is the API's estimate, not the length of this page",
  /typeof data\?\.data\?\.estimatedTotalHits === "number"[\s\S]{0,120}data\.data\.estimatedTotalHits/.test(
    service,
  ),
  "`hits.length` is 20 on every page, which would make paging stop early.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("\u00a75  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:search"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m\u2717 ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m\u2713 ${passed}/${passed} search assertions passed\x1b[0m\n`);
