#!/usr/bin/env node
/**
 * Phase 2 guard — the bilingual contract in Plan.md §5.
 *
 * The compiler already proves a good deal: `keyParity.ts` fails the build when
 * the two dictionaries hold different keys, and `MessageKey<N>` makes `t("typo")`
 * a type error. This file exists for everything types cannot see.
 *
 * Types cannot see that a Portuguese string says `{nome}` where the English one
 * says `{name}` — that renders the literal `{nome}` to a Portuguese customer and
 * nothing else goes wrong. They cannot see an `aria-label="Close"` hard-coded in
 * JSX, which is how the previous app shipped nine English labels into a
 * Portuguese product. They cannot see `new Intl.DateTimeFormat("en-GB")` in a
 * component, or `<html lang="en">` on a page served in Portuguese, or a key that
 * nothing uses any more.
 *
 * Every assertion names a rule, not a value. Where one looks like it is checking
 * a literal — a language tag, a bracket — the literal is how the rule is
 * detected, not what is being asserted.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const I18N = join(SRC, "i18n");
const LIB_I18N = join(SRC, "lib", "i18n");
const DICT_ROOT = join(I18N, "dictionaries");

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) passed += 1;
  else failures.push(detail ? `${name}\n      ${detail}` : name);
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

const rel = (f) => relative(ROOT, f);

// ── helpers ──────────────────────────────────────────────────────────────────

function filesUnder(dir, exts = [".ts", ".tsx"]) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".next")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...filesUnder(full, exts));
    else if (exts.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

/** Source with comments removed. Character-walking rather than a regex, for the
 *  reason recorded in verify-structure.mjs: a regex stripper cannot tell a
 *  comment from a `/` inside a string or a regex literal, and gets it wrong
 *  silently. Kept identical to that copy on purpose — two strippers that
 *  disagree would make two guards disagree about the same file. */
function stripComments(src) {
  let out = "";
  let i = 0;
  // What can legally precede a regex literal rather than a division sign.
  //
  // `<` and `}` are deliberately NOT in this set, and that is a bug fix, not an
  // oversight. With them, `</select>` and `{...props} />` both look like the
  // start of a regex: the stripper then consumes everything up to the next `/`
  // and silently deletes a span of real code. Every guard that reads a `.tsx`
  // file was quietly blind to whatever fell inside those spans — which is how a
  // rule can pass on a file that breaks it.
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

const PLACEHOLDER = /\{(\w+)\}/g;
const placeholdersIn = (message) =>
  new Set([...message.matchAll(PLACEHOLDER)].map((m) => m[1]));

// ── the single sources of truth, read the way the app reads them ─────────────
//
// `locale.ts` and the dictionaries import nothing, so Node's type stripping can
// load them directly. Reading the real modules rather than re-parsing their
// text is the difference between checking the app and checking a copy of it.

const { LOCALES, DEFAULT_LOCALE, BCP47 } = await import(
  pathToFileURL(join(LIB_I18N, "locale.ts")).href
);

const namespacesSrc = readFileSync(join(I18N, "namespaces.ts"), "utf8");
const NAMESPACES = [
  ...(stripComments(namespacesSrc)
    .match(/NAMESPACES\s*=\s*\[([^\]]*)\]/)?.[1]
    .matchAll(/"([^"]+)"/g) ?? []),
].map((m) => m[1]);

const srcFiles = filesUnder(SRC);
const tsxFiles = srcFiles.filter((f) => f.endsWith(".tsx"));
const stripped = new Map(
  srcFiles.map((f) => [f, stripComments(readFileSync(f, "utf8"))]),
);

// ─────────────────────────────────────────────────────────────────────────────
section("§1  Registry — every namespace exists in every language");

check(
  `NAMESPACES is readable and non-empty (${NAMESPACES.join(", ") || "none"})`,
  NAMESPACES.length > 0,
  "Everything below is derived from this list. If it cannot be read, nothing else here means anything.",
);

const dictionaries = new Map(); // `${locale}/${namespace}` → messages
for (const locale of LOCALES) {
  for (const ns of NAMESPACES) {
    const file = join(DICT_ROOT, locale, `${ns}.ts`);
    if (!existsSync(file)) {
      check(`${locale}/${ns}.ts exists`, false, `Expected ${rel(file)}.`);
      continue;
    }
    const mod = await import(pathToFileURL(file).href);
    dictionaries.set(`${locale}/${ns}`, mod.default);
    check(
      `${locale}/${ns} loads`,
      Boolean(mod.default),
      `${rel(file)} has no default export.`,
    );
  }
}

const declaredFiles = new Set(
  LOCALES.flatMap((l) => NAMESPACES.map((n) => join(DICT_ROOT, l, `${n}.ts`))),
);
const orphanDictionaries = filesUnder(DICT_ROOT).filter((f) => !declaredFiles.has(f));
check(
  "no dictionary file is missing from NAMESPACES",
  orphanDictionaries.length === 0,
  `A dictionary the registry does not name is never loaded — it reads as translated and ships as nothing.\n      ${orphanDictionaries.map(rel).join("\n      ")}`,
);

const namespacesCode = stripComments(namespacesSrc);
const missingFromType = NAMESPACES.filter(
  (ns) => !new RegExp(`\\b${ns}\\s*:\\s*typeof\\s`).test(namespacesCode),
);
check(
  "the Dictionary type names every namespace",
  missingFromType.length === 0,
  `Without an entry there, \`t\` for that namespace is typed \`never\` and every key is an error.\n      ${missingFromType.join(", ")}`,
);

const missingLoaders = NAMESPACES.filter((ns) =>
  LOCALES.some((l) => !namespacesCode.includes(`import("./dictionaries/${l}/${ns}")`)),
);
check(
  "every namespace has a static loader for every locale",
  missingLoaders.length === 0,
  `A loader built from a variable cannot be code-split, and a missing one throws at render.\n      ${missingLoaders.join(", ")}`,
);

const parityCode = stripComments(readFileSync(join(I18N, "keyParity.ts"), "utf8"));
const uncoveredByCompiler = NAMESPACES.filter((ns) => {
  const Ns = ns[0].toUpperCase() + ns.slice(1);
  return (
    !parityCode.includes(`${Ns}EnHasNoKeysMissingFromPt`) ||
    !parityCode.includes(`${Ns}PtHasNoKeysMissingFromEn`)
  );
});
check(
  "keyParity.ts checks every namespace, both directions",
  uncoveredByCompiler.length === 0,
  `A namespace missing from keyParity.ts loses the fast half of this guard — the one that fails in the editor rather than in CI.\n      ${uncoveredByCompiler.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  Dictionaries agree");

for (const ns of NAMESPACES) {
  const perLocale = LOCALES.map((l) => [l, dictionaries.get(`${l}/${ns}`) ?? {}]);
  const [[refLocale, reference] = []] = perLocale;

  for (const [locale, messages] of perLocale.slice(1)) {
    const missing = Object.keys(reference).filter((k) => !(k in messages));
    const extra = Object.keys(messages).filter((k) => !(k in reference));
    check(
      `${ns}: ${refLocale} and ${locale} hold the same keys`,
      missing.length === 0 && extra.length === 0,
      `\`t()\` falls back to the key itself, so a one-sided key renders as a raw identifier to exactly one language's customers.\n      missing from ${locale}: ${missing.join(", ") || "none"}\n      only in ${locale}:    ${extra.join(", ") || "none"}`,
    );
  }

  for (const [locale, messages] of perLocale) {
    const raw = readFileSync(join(DICT_ROOT, locale, `${ns}.ts`), "utf8");
    const declared = [
      ...stripComments(raw).matchAll(/^\s{2}([A-Za-z_$][\w$]*)\s*:/gm),
    ].map((m) => m[1]);
    const duplicates = declared.filter((k, i) => declared.indexOf(k) !== i);
    check(
      `${locale}/${ns}: no key is declared twice`,
      duplicates.length === 0,
      `The later one silently wins, and the translation someone actually edited is the one that disappears.\n      ${duplicates.join(", ")}`,
    );

    const blank = Object.entries(messages).filter(([, v]) => v.trim() === "");
    check(
      `${locale}/${ns}: no message is empty`,
      blank.length === 0,
      `An empty string is not a translation; it is a missing one that passes every other check here.\n      ${blank.map(([k]) => k).join(", ")}`,
    );

    // A euro sign next to a number is a price that was typed instead of
    // formatted. A euro sign with no number — "EUR (€)" on the currency
    // switcher — is the name of a currency, which is exactly what it should be.
    const withCurrency = Object.entries(messages).filter(([, v]) =>
      /€\s*[\d{]|[\d}]\s*€/.test(v),
    );
    check(
      `${locale}/${ns}: no message hard-codes a currency symbol`,
      withCurrency.length === 0,
      `Money is formatted by \`formatCurrency\`, which knows that pt-PT writes "12,50 €" and en-GB writes "€12.50". A symbol baked into a string is right for one reader.\n      ${withCurrency.map(([k]) => k).join(", ")}`,
    );

    const halfPlurals = Object.keys(messages).filter((k) => {
      const base = k.replace(/_(one|other)$/, "");
      if (base === k) return false;
      return !(`${base}_one` in messages) || !(`${base}_other` in messages);
    });
    check(
      `${locale}/${ns}: every plural has both forms`,
      halfPlurals.length === 0,
      `\`t.plural\` falls back to \`_other\`; a missing \`_other\` renders the key.\n      ${halfPlurals.join(", ")}`,
    );
  }

  for (const key of Object.keys(reference ?? {})) {
    const shapes = perLocale.map(([locale, messages]) => [
      locale,
      [...placeholdersIn(messages[key] ?? "")].sort().join(","),
    ]);
    const distinct = new Set(shapes.map(([, s]) => s));
    check(
      `${ns}.${key}: the same values in every language`,
      distinct.size === 1,
      `A translated placeholder is not substituted — the customer reads the braces. Nothing else goes wrong, which is why this survives review.\n      ${shapes.map(([l, s]) => `${l}: {${s}}`).join("  ")}`,
    );
  }
}

const keyOwners = new Map();
for (const ns of NAMESPACES) {
  for (const key of Object.keys(dictionaries.get(`${DEFAULT_LOCALE}/${ns}`) ?? {})) {
    keyOwners.set(`${ns}.${key}`, ns);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
section("§3  Every string is used, and used with its values");

/**
 * Which files can see which namespace.
 *
 * Usage is checked per namespace rather than globally, so two namespaces are
 * free to hold a key of the same name — `nav.electronics` is a menu item and
 * `footer.electronicsLink` is a link, and forcing one of them to be renamed to
 * keep a search unambiguous would be the guard dictating the vocabulary.
 *
 * A file "declares" a namespace by naming it in `getTranslations`,
 * `useTranslation` or `loadNamespace`. That is the same string the type system
 * uses to decide which keys `t` accepts, so the two cannot disagree.
 */
const namespaceUsers = new Map(NAMESPACES.map((ns) => [ns, []]));
for (const [file, code] of stripped) {
  if (file.startsWith(DICT_ROOT + sep)) continue;
  for (const m of code.matchAll(
    /(?:getTranslations|useTranslation|loadNamespace)\s*\([^)]*?"(\w+)"/g,
  )) {
    namespaceUsers.get(m[1])?.push(code);
  }
  // A file may also import a dictionary directly. `global-error.tsx` has to:
  // it renders when the root layout itself has failed, so there is no provider
  // and no server context to ask, and a static import is the only way it has
  // any words at all.
  for (const m of code.matchAll(/dictionaries\/\w+\/(\w+)"/g)) {
    namespaceUsers.get(m[1])?.push(code);
  }
}

const unusedNamespaces = NAMESPACES.filter(
  (ns) => (namespaceUsers.get(ns) ?? []).length === 0,
);
check(
  `every namespace is loaded by something (${NAMESPACES.length})`,
  unusedNamespaces.length === 0,
  `A namespace nothing asks for ships nothing and proves nothing — and every key in it would look "used" to a search that had no scope.\n      ${unusedNamespaces.join(", ")}`,
);

const unusedKeys = [];
const missingValues = [];
for (const ns of NAMESPACES) {
  const scope = (namespaceUsers.get(ns) ?? []).join("\n");
  const messages = dictionaries.get(`${DEFAULT_LOCALE}/${ns}`) ?? {};
  for (const [key, message] of Object.entries(messages)) {
    const base = key.replace(/_(one|other)$/, "");
    // `t("key")` in most files, `errors.criticalError` in the one that imports a
    // dictionary directly. Both are matched; a bare word is not, so a `nav`
    // file mentioning "search" in a class name does not count as using
    // `nav.search`.
    const used = (k) => new RegExp(`"${k}"|\\.${k}\\b`).test(scope);
    const referenced = used(key) || (base !== key && used(base));
    if (!referenced) unusedKeys.push(`${ns}.${key}`);

    const slots = placeholdersIn(message);
    if (base !== key) slots.delete("count"); // supplied by `t.plural` itself
    if (slots.size === 0) continue;
    if (new RegExp(`\\(\\s*"${base}"\\s*\\)`).test(scope)) {
      missingValues.push(`${ns}.${key} needs {${[...slots].join(", ")}}`);
    }
  }
}
check(
  `no dictionary key is unused (${keyOwners.size} keys across ${NAMESPACES.length} namespaces)`,
  unusedKeys.length === 0,
  `A string nobody renders still has to be translated, reviewed and shipped. The previous app carried hundreds. Delete it, or use it.\n      ${unusedKeys.join(", ")}`,
);
check(
  "no message with placeholders is called without values",
  missingValues.length === 0,
  `The placeholder is rendered literally — the customer reads \`{name}\`.\n      ${missingValues.join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  Nothing user-visible is hard-coded");

const RENDERING_DIRS = ["app", "components", "features"].map((d) => join(SRC, d));
const renderingFiles = tsxFiles.filter((f) =>
  RENDERING_DIRS.some((d) => f.startsWith(d + sep)),
);

const TRANSLATABLE_ATTRS =
  /\b(aria-label|aria-description|aria-roledescription|aria-placeholder|alt|title|placeholder)\s*=\s*\{?\s*"([^"]*)"/g;
// Only attributes on real HTML elements. A lowercase tag name is an element
// whose `title` a browser shows and a screen reader reads; an uppercase one is
// a component, and `title` there is a prop whose meaning its own JSX decides —
// flagging that would be reporting on a name rather than on what reaches a
// person.
const HTML_ELEMENT = /<([a-z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const attrLiterals = [];
for (const file of renderingFiles) {
  for (const tag of (stripped.get(file) ?? "").matchAll(HTML_ELEMENT)) {
    for (const m of (tag[2] ?? "").matchAll(TRANSLATABLE_ATTRS)) {
      if (/[A-Za-zÀ-ÿ]{2,}/.test(m[2])) {
        attrLiterals.push(`${rel(file)}  <${tag[1]} ${m[1]}="${m[2]}">`);
      }
    }
  }
}
check(
  `no translatable attribute holds a literal (${renderingFiles.length} files scanned)`,
  attrLiterals.length === 0,
  `An \`aria-label\` is text a person reads; it is invisible to everyone reviewing the page, which is why the previous app shipped nine English ones to Portuguese users.\n      ${attrLiterals.join("\n      ")}`,
);

const JSX_TEXT = />([^<>{}]*[A-Za-zÀ-ÿ]{2,}[^<>{}]*)<\//g;
const textLiterals = [];
for (const file of renderingFiles) {
  for (const m of (stripped.get(file) ?? "").matchAll(JSX_TEXT)) {
    const text = m[1].trim();
    if (text && !/^&\w+;$/.test(text)) textLiterals.push(`${rel(file)}  "${text}"`);
  }
}
check(
  "no JSX text node is a literal",
  textLiterals.length === 0,
  `Every word a customer reads comes from a dictionary, in both languages, or it is a word only half of them can read.\n      ${textLiterals.join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The locale is one thing, decided in one place");

const localeFile = join(LIB_I18N, "locale.ts");
const elsewhere = srcFiles.filter((f) => f !== localeFile);

const tagLiterals = elsewhere.filter((f) =>
  new RegExp(`["'](?:${LOCALES.join("|")})-[A-Za-z]{2}["']`).test(
    stripped.get(f) ?? "",
  ),
);
check(
  `no BCP-47 tag is written outside locale.ts (${Object.values(BCP47).join(", ")})`,
  tagLiterals.length === 0,
  `Three files in the previous app each kept their own \`{ en: "en-GB", pt: "pt-PT" }\`, and one of them was wrong.\n      ${tagLiterals.map(rel).join("\n      ")}`,
);

const unionLiterals = elsewhere.filter((f) =>
  /["'](?:en|pt)["']\s*\|\s*["'](?:en|pt)["']/.test(stripped.get(f) ?? ""),
);
check(
  "no file re-declares the locale union by hand",
  unionLiterals.length === 0,
  `\`Locale\` is derived from \`LOCALES\`. A hand-written \`"en" | "pt"\` is a third language away from being wrong, and it will not be a compile error when it is.\n      ${unionLiterals.map(rel).join("\n      ")}`,
);

const intlLiterals = srcFiles
  .filter((f) => !f.startsWith(LIB_I18N + sep))
  .filter((f) => /new\s+Intl\.\w+\(\s*["']/.test(stripped.get(f) ?? ""));
check(
  "no Intl formatter is constructed with a literal locale",
  intlLiterals.length === 0,
  `That is a Portuguese page formatting its dates in English and looking fine to whoever wrote it.\n      ${intlLiterals.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  Routing carries the language");

const htmlFiles = srcFiles.filter((f) => /<html[\s>]/.test(stripped.get(f) ?? ""));
check(
  `something renders <html> (${htmlFiles.length} file${htmlFiles.length === 1 ? "" : "s"})`,
  htmlFiles.length > 0,
  "Without a root layout there is no `lang` attribute to be right or wrong about.",
);
const staticLang = htmlFiles.filter((f) =>
  /<html[^>]*\blang\s*=\s*"/.test(stripped.get(f) ?? ""),
);
check(
  "<html lang> is bound to the active locale, never a literal",
  staticLang.length === 0,
  `This is the defect the previous app shipped for its entire life: \`lang="en"\` on a product whose default language is Portuguese. Screen readers pick a voice from it and translation tools trust it.\n      ${staticLang.map(rel).join("\n      ")}`,
);

const routeFiles = filesUnder(join(SRC, "app")).filter((f) =>
  /(^|[\\/])(page|layout|template|default)\.tsx?$/.test(f),
);
const outsideLocale = routeFiles.filter(
  (f) => !relative(join(SRC, "app"), f).startsWith("[locale]" + sep),
);
check(
  `every route file lives under [locale] (${routeFiles.length} checked)`,
  outsideLocale.length === 0,
  `A page above the locale segment has no language to render in, and no URL a search engine can index per language.\n      ${outsideLocale.map(rel).join("\n      ")}`,
);

const localeLayout = join(SRC, "app", "[locale]", "layout.tsx");
const layoutCode = stripped.get(localeLayout) ?? "";
check(
  "the locale layout generates a page per language",
  /generateStaticParams/.test(layoutCode) && /LOCALES/.test(layoutCode),
  "Both languages are prerendered, and the list comes from LOCALES rather than being written out again here.",
);
check(
  "an unknown locale is a 404, not a fallback",
  /dynamicParams\s*=\s*false/.test(layoutCode),
  "`/de/cart` served in Portuguese would be a second URL for the same page in a language nobody asked for.",
);

const proxyFile = join(SRC, "proxy.ts");
check(
  "a proxy puts a locale on every unprefixed request",
  existsSync(proxyFile),
  "Next 16 renamed `middleware.ts` to `proxy.ts`. Without it, `/` renders nothing and `/cart` 404s.",
);
if (existsSync(proxyFile)) {
  const proxyCode = stripComments(readFileSync(proxyFile, "utf8"));
  // A locale appearing anywhere in a string here — bare (`"pt"`) or as a path
  // segment (`"/pt"`, `"/pt/cart"`) — is routing logic that knows one language
  // by name.
  const localeInString = new RegExp(`["']/?(?:${LOCALES.join("|")})(?:["']|/)`);
  check(
    "the proxy derives its locales from lib/i18n rather than listing them",
    /@\/lib\/i18n\//.test(proxyCode) && !localeInString.test(proxyCode),
    "A third language must not require editing the redirect logic.",
  );
  check(
    "the proxy runs on app routes and not on assets",
    /matcher/.test(proxyCode) && /_next/.test(proxyCode),
    "Matching `/_next/...` or a static file would rewrite it under a language and 404 it.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section("§7  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:i18n"),
  "A guard nothing calls passes forever.",
);
check(
  "`pnpm typecheck` generates route types before checking them",
  /next typegen/.test(pkg.scripts?.typecheck ?? ""),
  "`LayoutProps<'/[locale]'>` and `next/root-params` are generated. Without typegen, a clean checkout fails to typecheck for a reason that points nowhere near the cause.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} i18n assertions passed\x1b[0m\n`);
