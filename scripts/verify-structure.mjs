#!/usr/bin/env node
/**
 * Phase 0 guard — the architectural boundaries in Plan.md §3.
 *
 * On the previous project the rules in this file existed as prose in a plan
 * document. They were broken repeatedly, not out of carelessness but because
 * nothing failed when they were. A rule nobody can violate accidentally is
 * worth more than a rule everybody agrees with.
 *
 * Every assertion below names a RELATIONSHIP, not a value. `assert(gap === 16)`
 * documents one afternoon; `assert(sectionGap < headingGap)` documents the
 * intent and survives the next redesign. Where an assertion here looks like it
 * is checking a literal, read the message — the literal is how the relationship
 * is detected, not what is being asserted.
 *
 * The last section guards the guards: it asks ESLint itself whether the
 * boundary rules are live for the paths they protect. A lint config that has
 * silently stopped applying is worse than no config, because it reads as
 * protection.
 */
import { ESLint } from "eslint";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
  } else {
    failures.push(detail ? `${name}\n      ${detail}` : name);
  }
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Every file under `dir` matching `exts`, recursively. */
function filesUnder(dir, exts = [".ts", ".tsx"]) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...filesUnder(full, exts));
    else if (exts.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

/** Source with comments removed, so a rule about code is not defeated — or
 *  triggered — by prose. A comment mentioning `@/features/cart/api` is
 *  documentation, not an import.
 *
 *  This walks characters rather than running a regex over the whole file,
 *  because the regex version is wrong in a way that is easy to miss: the glob
 *  `"@/*": ["./src/*"]` in tsconfig.json opens what looks like a block comment,
 *  and the next `*​/` inside `"**​/*.ts"` closes it. A naive strip silently ate
 *  half the compiler options and left behind valid-looking JSON. Strings and
 *  regex literals have to be understood, not skipped over. */
function stripComments(src) {
  let out = "";
  let i = 0;
  // What can legally precede a regex literal (rather than a division sign).
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

/** Module specifiers this file imports — static imports, `export from`, and
 *  dynamic `import()`. */
function importsOf(src) {
  const code = stripComments(src);
  const specs = [];
  const patterns = [
    /\bimport\s+[^;]*?\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bexport\s+[^;]*?\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code))) specs.push(m[1]);
  }
  return specs;
}

const rel = (f) => relative(ROOT, f);

// ─────────────────────────────────────────────────────────────────────────────
section("§1  Skeleton (Plan.md §3.1)");

const REQUIRED_DIRS = [
  "src/app",
  "src/features",
  "src/components/ui",
  "src/components/layout",
  "src/components/shared",
  "src/hooks",
  "src/lib",
  "src/i18n",
  "src/stores",
  "src/types",
  "src/styles",
  "scripts",
];
for (const d of REQUIRED_DIRS) {
  check(
    `${d} exists`,
    existsSync(join(ROOT, d)),
    "Plan.md §3.1 names this directory; a phase that needs it should not have to invent where it goes.",
  );
}

const ROUTE_GROUPS = ["(marketing)", "(shop)", "(services)", "(account)", "(checkout)"];
for (const g of ROUTE_GROUPS) {
  check(
    `route group ${g} exists under [locale]`,
    existsSync(join(SRC, "app", "[locale]", g)),
    "The locale segment wraps every route group — that is what makes both languages routable rather than a runtime toggle.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section("§2  Path alias");

const tsconfigRaw = readFileSync(join(ROOT, "tsconfig.json"), "utf8");
const tsconfig = JSON.parse(stripComments(tsconfigRaw));
const aliasTargets = tsconfig.compilerOptions?.paths?.["@/*"] ?? [];
check(
  "`@/*` resolves to ./src/*",
  aliasTargets.includes("./src/*"),
  "Every rule in this file distinguishes an import that names another area from one that stays local. Without the alias that distinction is invisible.",
);

const escapingRelatives = [];
for (const file of filesUnder(SRC)) {
  for (const spec of importsOf(readFileSync(file, "utf8"))) {
    if (!spec.startsWith("../")) continue;
    const target = resolve(dirname(file), spec);
    const from = relative(SRC, file).split(sep)[0];
    const to = relative(SRC, target).split(sep)[0];
    if (from !== to) escapingRelatives.push(`${rel(file)} → ${spec}`);
  }
}
check(
  "no relative import climbs out of its own top-level area",
  escapingRelatives.length === 0,
  `Use \`@/\` to cross an area boundary — a relative path that leaves its own folder hides the crossing.\n      ${escapingRelatives.join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  lib/ is pure");

const IMPURE = /^(react|react-dom|next)(\/|$)/;
const libFiles = filesUnder(join(SRC, "lib"));
const impureLib = libFiles.filter((f) =>
  importsOf(readFileSync(f, "utf8")).some((s) => IMPURE.test(s) || s.startsWith("@/")),
);
check(
  "lib/ imports no React, no Next, and no app code",
  impureLib.length === 0,
  `Pure functions are the only code that can be reasoned about without running it.\n      ${impureLib.map(rel).join("\n      ")}`,
);

const clientLib = libFiles.filter((f) =>
  /^\s*["']use client["']/m.test(readFileSync(f, "utf8")),
);
check(
  "no file in lib/ is a client module",
  clientLib.length === 0,
  `A "use client" directive in lib/ means the file is not a utility.\n      ${clientLib.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  components/ui knows no domain");

const uiFiles = filesUnder(join(SRC, "components", "ui"));
const uiViolations = uiFiles.filter((f) =>
  importsOf(readFileSync(f, "utf8")).some((s) =>
    /^@\/(features|services|stores)(\/|$)/.test(s),
  ),
);
check(
  "components/ui imports no feature, service or store",
  uiViolations.length === 0,
  `A primitive that knows what an order is stops being reusable the moment a second product needs it.\n      ${uiViolations.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  Feature boundary");

const featureRoot = join(SRC, "features");
const featureNames = existsSync(featureRoot)
  ? readdirSync(featureRoot).filter((n) => statSync(join(featureRoot, n)).isDirectory())
  : [];

const reachThrough = [];
for (const file of filesUnder(SRC)) {
  for (const spec of importsOf(readFileSync(file, "utf8"))) {
    if (/^@\/features\/[^/]+\/.+/.test(spec))
      reachThrough.push(`${rel(file)} → ${spec}`);
  }
}
check(
  "no import reaches past a feature's index",
  reachThrough.length === 0,
  `\`@/features/x\` is the public surface; \`@/features/x/api/...\` is the inside. Reaching in is what turns two features into one.\n      ${reachThrough.join("\n      ")}`,
);

const featuresWithoutIndex = featureNames.filter(
  (n) =>
    !existsSync(join(featureRoot, n, "index.ts")) &&
    !existsSync(join(featureRoot, n, "index.tsx")),
);
check(
  `every feature exposes an index (${featureNames.length} feature${featureNames.length === 1 ? "" : "s"})`,
  featuresWithoutIndex.length === 0,
  `A feature with no index has no public surface, so every import into it is a reach-through.\n      ${featuresWithoutIndex.join(", ")}`,
);

const strayBarrels = filesUnder(SRC)
  .filter((f) => /(^|[\\/])index\.tsx?$/.test(f))
  .filter((f) => {
    const parts = relative(SRC, f).split(sep);
    return !(parts[0] === "features" && parts.length === 3);
  });
check(
  "no barrel file outside features/*/index.ts",
  strayBarrels.length === 0,
  `Barrels defeat tree-shaking, which is the whole reason Plan.md §6 can set a bundle budget at all.\n      ${strayBarrels.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  Client boundary");

const routeShells = filesUnder(join(SRC, "app")).filter((f) =>
  /(^|[\\/])(layout|page)\.tsx?$/.test(f),
);
const clientShells = routeShells.filter((f) =>
  /^\s*["']use client["']/m.test(readFileSync(f, "utf8")),
);
check(
  `no route shell is a client module (${routeShells.length} checked)`,
  clientShells.length === 0,
  `"use client" belongs on the smallest leaf that needs it. On a page or layout it drags the whole subtree into the client bundle.\n      ${clientShells.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§7  Environment contract");

const envExampleRaw = readFileSync(join(ROOT, ".env.example"), "utf8");
const keysOf = (raw) =>
  new Set([...raw.matchAll(/^\s*([A-Z_0-9]+)\s*=/gm)].map((m) => m[1]));
const documented = keysOf(envExampleRaw);

const envReaders = [...filesUnder(SRC), join(ROOT, "next.config.ts")].filter(
  existsSync,
);
const read = new Set();
for (const f of envReaders) {
  for (const m of stripComments(readFileSync(f, "utf8")).matchAll(
    /process\.env\.([A-Z_0-9]+)/g,
  )) {
    read.add(m[1]);
  }
}
read.delete("NODE_ENV"); // supplied by the runtime, not by us

const undocumented = [...read].filter((k) => !documented.has(k));
check(
  `every variable the code reads is in .env.example (${read.size} read, ${documented.size} documented)`,
  undocumented.length === 0,
  `.env.example is the only record that a variable exists. A reader that is not listed is a deploy that fails for reasons nobody can look up.\n      ${undocumented.join(", ")}`,
);

// The reverse direction. Most variables here are for phases that have not
// happened yet — that is legitimate, but only if the file says so. Without this
// the file rots into a list nobody trusts.
const unreadWithoutPhase = [];
for (const key of documented) {
  if (read.has(key)) continue;
  const at = envExampleRaw.indexOf(`\n${key}=`);
  const preceding = envExampleRaw.slice(Math.max(0, at - 1200), at);
  const block = preceding.split(/\n\s*\n/).pop() ?? "";
  if (!/Phase \d+|Not read by the app/.test(block)) unreadWithoutPhase.push(key);
}
check(
  "every documented-but-unread variable says which phase needs it",
  unreadWithoutPhase.length === 0,
  `Otherwise there is no way to tell a variable that is pending from one that is dead.\n      ${unreadWithoutPhase.join(", ")}`,
);

const envLocalPath = join(ROOT, ".env.local");
if (existsSync(envLocalPath)) {
  const local = keysOf(readFileSync(envLocalPath, "utf8"));
  const missing = [...documented].filter((k) => !local.has(k));
  const extra = [...local].filter((k) => !documented.has(k));
  check(
    "the local env defines exactly the documented key set",
    missing.length === 0 && extra.length === 0,
    `Drift here is invisible until something fails at runtime.\n      missing: ${missing.join(", ") || "none"}\n      extra:   ${extra.join(", ") || "none"}`,
  );
}

const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
check(
  ".gitignore ignores env files but keeps .env.example",
  /^\.env\*/m.test(gitignore) && /^!\.env\.example/m.test(gitignore),
  "`.env*` matches `.env.example` too. Without the negation the one file that documents the others is the one that never gets committed.",
);
check(
  ".gitignore excludes the build output",
  /^\/?\.next\/?/m.test(gitignore),
  "A committed .next is both large and stale.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§8  The guards themselves");

const eslint = new ESLint({ cwd: ROOT });
const PROTECTED = [
  ["src/components/ui/Button.tsx", "components/ui"],
  ["src/lib/format.ts", "lib"],
  ["src/features/cart/components/CartRow.tsx", "a feature"],
];
for (const [probe, label] of PROTECTED) {
  const config = await eslint.calculateConfigForFile(join(ROOT, probe));
  const rule = config.rules?.["no-restricted-imports"];
  const active = Array.isArray(rule) ? rule[0] === "error" || rule[0] === 2 : false;
  check(
    `the import boundary is live for ${label}`,
    active,
    `ESLint reports no \`no-restricted-imports\` rule for ${probe}. The rule exists in the config file but is not reaching this path — which reads as protection while providing none.`,
  );
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const gate = pkg.scripts?.gate ?? "";
const gateMembers = ["typecheck", "lint", "verify", "build:check"];
const missingFromGate = gateMembers.filter((s) => !gate.includes(s));
check(
  "the gate script runs every check this phase added",
  missingFromGate.length === 0,
  `A check that is not in the gate is a check that runs when someone remembers.\n      missing: ${missingFromGate.join(", ")}`,
);

const verifyScripts = Object.keys(pkg.scripts ?? {}).filter((s) =>
  s.startsWith("verify:"),
);
const verifyAggregate = pkg.scripts?.verify ?? "";
const orphanVerifiers = verifyScripts.filter((s) => !verifyAggregate.includes(s));
check(
  `every verify:* script is reachable from \`pnpm verify\` (${verifyScripts.length})`,
  orphanVerifiers.length === 0,
  `Later phases add more of these. One that nothing calls will pass forever.\n      ${orphanVerifiers.join(", ")}`,
);

const buildCheck = stripComments(
  readFileSync(join(ROOT, "scripts", "build-check.mjs"), "utf8"),
);
check(
  "the build check writes somewhere other than the dev server's .next/",
  /NEXT_DIST_DIR/.test(buildCheck) &&
    /distDir/.test(stripComments(readFileSync(join(ROOT, "next.config.ts"), "utf8"))),
  "A verification build that shares `.next/` with a running dev server corrupts it, and the symptom — stale chunks, a route that 404s until restart — never points back here.",
);
check(
  "the redirected build output is ignored by git",
  /^\/?\.next-build\/?/m.test(gitignore),
  "It is a full build output; committing it is both large and meaningless.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} structure assertions passed\x1b[0m\n`);
