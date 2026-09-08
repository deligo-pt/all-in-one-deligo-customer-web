#!/usr/bin/env node
/**
 * Phase 1 guard — the design system contract in Plan.md §4.
 *
 * Half of this phase's enforcement is not here at all, and that is the better
 * half: `--color-*: initial` in `globals.css` clears Tailwind's ~290 default
 * colours, and the same for type, radii, shadows and easing. `bg-red-500` does
 * not fail lint — it does not compile. A value outside the design cannot reach
 * the DOM by accident.
 *
 * What is left for this file is what the compiler cannot see: a hex typed
 * straight into a component, an arbitrary `text-[13px]` that slips past the
 * scale, a token nobody uses, a semantic role that got a literal instead of a
 * pointer at a primitive — which would quietly cost us the dark-mode hook the
 * layering exists for — and the reduced-motion opt-out.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const GLOBALS = join(SRC, "app", "globals.css");

let passed = 0;
const failures = [];
const check = (name, ok, detail = "") => {
  if (ok) passed += 1;
  else failures.push(detail ? `${name}\n      ${detail}` : name);
};
const section = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);
const rel = (f) => relative(ROOT, f);

function filesUnder(dir, exts) {
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

/** JS/TS comments removed — a hex in a comment is documentation. Character
 *  walking, for the reason recorded in verify-structure.mjs. */
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

/** CSS comments only — `/* … *​/`. A CSS file has no `//` comments and no regex
 *  literals, so the JS stripper's cleverness would only be a liability here. */
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** The body of `@theme { … }` / `@theme inline { … }`, brace-matched. */
function themeBlocks(css) {
  const blocks = [];
  const re = /@theme(\s+inline)?\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") depth -= 1;
      i += 1;
    }
    blocks.push({ inline: Boolean(m[1]), body: css.slice(re.lastIndex, i - 1) });
  }
  return blocks;
}

// `--color-*: initial` is a namespace reset, so `*` has to be part of a name.
const declarationsIn = (body) =>
  [...body.matchAll(/^\s*(--[\w*-]+)\s*:\s*([^;]+);/gm)].map((m) => [
    m[1],
    m[2].trim(),
  ]);

const cssRaw = readFileSync(GLOBALS, "utf8");
const css = stripCssComments(cssRaw);
const blocks = themeBlocks(css);
const inlineTokens = new Map(
  blocks.filter((b) => b.inline).flatMap((b) => declarationsIn(b.body)),
);
const staticTokens = new Map(
  blocks.filter((b) => !b.inline).flatMap((b) => declarationsIn(b.body)),
);
const themeTokens = new Map([...inlineTokens, ...staticTokens]);

const rootBody = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
const rootTokens = new Map(declarationsIn(rootBody));

const componentFiles = filesUnder(SRC, [".ts", ".tsx"]);
const componentCode = componentFiles.map((f) => [
  f,
  stripComments(readFileSync(f, "utf8")),
]);
const allComponentCode = componentCode.map(([, s]) => s).join("\n");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  Values live in globals.css and nowhere else");

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const hexOffenders = componentCode
  .filter(([, s]) => HEX.test(s) && (HEX.lastIndex = 0) === 0)
  .map(([f, s]) => `${rel(f)}  ${[...s.matchAll(HEX)].map((m) => m[0]).join(" ")}`)
  .filter((line) => line.includes("#"));
check(
  `no component writes a colour literal (${componentFiles.length} files)`,
  hexOffenders.length === 0,
  `A hex in a component is a colour that no longer has a name, cannot be found by searching for a role, and will not change when the role does.\n      ${hexOffenders.join("\n      ")}`,
);

const FUNC_COLOUR = /\b(?:rgba?|hsla?|oklch|color-mix)\s*\(/;
const funcOffenders = componentCode
  .filter(([, s]) => FUNC_COLOUR.test(s))
  .map(([f]) => rel(f));
check(
  "no component builds a colour with rgb()/hsl()/color-mix()",
  funcOffenders.length === 0,
  `Same rule as the hex above; the notation is not the point.\n      ${funcOffenders.join("\n      ")}`,
);

// The rule is about values that should have come from the scale, so it applies
// to the utilities the scale covers — and only those. `w-[min(32rem,…)]` is a
// layout expression with no token behind it, and `data-[state=open]` is a
// variant selector, not a value; flagging either would teach people to ignore
// this check. An arbitrary value that names a token — `[var(--dg-…)]` — is how
// an exception is written and is allowed.
const TOKENISED_UTILITIES = [
  "text",
  "bg",
  "border",
  "rounded",
  "shadow",
  "ease",
  "leading",
  "tracking",
  "font",
  "fill",
  "stroke",
  "ring",
  "outline",
  "decoration",
  "from",
  "via",
  "to",
  "p",
  "px",
  "py",
  "ps",
  "pe",
  "pt",
  "pb",
  "m",
  "mx",
  "my",
  "ms",
  "me",
  "mt",
  "mb",
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "size",
  "duration",
];
const ARBITRARY = new RegExp(
  `\\b(?:${TOKENISED_UTILITIES.join("|")})-\\[(?!var\\(--dg-)([^\\]\\s]+)\\]`,
  "g",
);
const arbitrary = [];
for (const [f, s] of componentCode) {
  for (const m of s.matchAll(ARBITRARY)) arbitrary.push(`${rel(f)}  ${m[0]}`);
}
check(
  "no arbitrary value escapes the scale",
  arbitrary.length === 0,
  `\`text-[13px]\` is how a scale dies: it is always locally reasonable and never systematically. If the design really needs the value, it belongs in globals.css with the frequency that justifies it. A bracket naming a token — \`duration-[var(--dg-duration-fast)]\` — is fine and is not what this matches.\n      ${arbitrary.join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  The scale is closed");

const RESET_NAMESPACES = [
  "color",
  "font",
  "text",
  "leading",
  "tracking",
  "radius",
  "shadow",
  "ease",
  "container",
];
const unreset = RESET_NAMESPACES.filter((ns) => !themeTokens.has(`--${ns}-*`));
check(
  `every namespace we own is cleared of Tailwind's defaults (${RESET_NAMESPACES.length})`,
  unreset.length === 0,
  `Without \`--${unreset[0] ?? "x"}-*: initial\`, Tailwind's own scale stays available alongside ours and \`bg-red-500\` compiles. This one line is worth more than every grep in this file.\n      missing: ${unreset.join(", ")}`,
);

// Which utility prefixes can consume a token from each namespace.
const UTILITY_PREFIXES = {
  color: [
    "bg",
    "text",
    "border",
    "ring",
    "fill",
    "stroke",
    "outline",
    "from",
    "via",
    "to",
    "shadow",
    "decoration",
    "placeholder",
    "caret",
    "accent",
    "divide",
  ],
  text: ["text"],
  leading: ["leading"],
  tracking: ["tracking"],
  radius: ["rounded"],
  shadow: ["shadow", "inset-shadow"],
  ease: ["ease"],
  animate: ["animate"],
  container: ["max-w", "min-w", "w"],
  font: ["font"],
};

const unusedTokens = [];
for (const [token] of themeTokens) {
  if (token.endsWith("-*")) continue;
  // `--text-14--line-height` is a modifier on `--text-14`, not a token of its
  // own; it is checked as a pair below.
  if (token.slice(2).includes("--")) continue;
  const m = token.match(/^--([a-z]+)-(.+)$/);
  if (!m) continue;
  const [, ns, name] = m;
  const prefixes = UTILITY_PREFIXES[ns];
  if (!prefixes) continue;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const usedAsUtility = prefixes.some((p) =>
    new RegExp(`\\b${p}(?:-[a-z]+)?-${escaped}\\b`).test(allComponentCode),
  );
  // A token can also be consumed by the stylesheet itself — `--font-sans` is
  // applied to `html` rather than through a class.
  const usedInCss = new RegExp(`var\\(${token}\\)`).test(css);
  if (!usedAsUtility && !usedInCss) unusedTokens.push(token);
}

const orphanLineHeights = [...themeTokens.keys()]
  .filter((t) => t.endsWith("--line-height"))
  .filter((t) => !themeTokens.has(t.replace("--line-height", "")));
check(
  "every line-height modifier belongs to a size that exists",
  orphanLineHeights.length === 0,
  `A modifier whose base was renamed or removed is silently ignored by Tailwind, and the size falls back to whatever it inherits.\n      ${orphanLineHeights.join(", ")}`,
);
check(
  `every design token is rendered somewhere (${[...themeTokens.keys()].filter((t) => !t.endsWith("-*")).length} tokens)`,
  unusedTokens.length === 0,
  `A token nothing uses has never been seen. The tokens page exists so that this rule can be true — add it there, or delete the token.\n      ${unusedTokens.join(", ")}`,
);

// A primitive earns its place by being pointed at — from a role in this
// stylesheet, or from a token reference in a component
// (`duration-[var(--dg-duration-fast)]`).
const orphanPrimitives = [...rootTokens.keys()].filter((t) => {
  const pattern = new RegExp(`var\\(${t}\\)`);
  return !pattern.test(css) && !pattern.test(allComponentCode);
});
check(
  `every primitive is pointed at by a role (${rootTokens.size} declared)`,
  orphanPrimitives.length === 0,
  `A measured value with no role attached is a value nobody decided to use.\n      ${orphanPrimitives.join(", ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The layering that makes dark mode possible later (D-3)");

const colourUtilities = [...inlineTokens].filter(
  ([t]) => t.startsWith("--color-") && !t.endsWith("-*"),
);
const literalRoles = colourUtilities.filter(([, v]) => !/^var\(--dg-/.test(v));
check(
  `every colour utility points at a role, never at a value (${colourUtilities.length} mapped)`,
  literalRoles.length === 0,
  `\`@theme inline\` with \`var(--dg-…)\` is what lets a scope redefine a role and change every utility at once. A literal here compiles the value into the utility and the hook is gone — which is only discovered when dark mode is attempted, by which point every screen is built.\n      ${literalRoles.map(([t, v]) => `${t}: ${v}`).join("\n      ")}`,
);

const rolesUsed = [
  ...new Set([...css.matchAll(/var\((--dg-[\w-]+)\)/g)].map((m) => m[1])),
];
const undeclaredRoles = rolesUsed.filter((r) => !rootTokens.has(r));
check(
  `every role referenced is declared (${rolesUsed.length} referenced)`,
  undeclaredRoles.length === 0,
  `An undefined custom property does not error — the declaration is simply dropped and the element inherits. Invisible in the build, visible as a missing colour.\n      ${undeclaredRoles.join(", ")}`,
);

const cssFiles = filesUnder(SRC, [".css"]);
const darkBlocks = cssFiles.filter((f) =>
  /prefers-color-scheme/.test(readFileSync(f, "utf8")),
);
check(
  "no dark-mode media query exists (D-3: light only in v1)",
  darkBlocks.length === 0,
  `The Figma file has no dark variants, so a \`prefers-color-scheme\` block can only be a guess — and create-next-app ships one by default. When dark mode is decided it arrives as a scoped redefinition of the roles in :root, not as a second set of values next to the first.\n      ${darkBlocks.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  Motion");

const reduced =
  css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ??
  "";
check(
  "a reduced-motion opt-out exists",
  reduced.length > 0,
  "Motion primitives without an opt-out are a vestibular trigger with a design system around it.",
);
check(
  "the opt-out covers animation and transition, not one of the two",
  /animation-duration/.test(reduced) && /transition-duration/.test(reduced),
  "Half an opt-out reads as an opt-out.",
);
check(
  "the opt-out clears animation-fill-mode",
  /animation-fill-mode:\s*none/.test(reduced),
  "The carried lesson: `animation-fill-mode: both` keeps applying an animation's final frame after it ends, which silently killed every card's press state on the previous project for six phases. Zero duration alone does not undo it.",
);
check(
  "the default transition is the design's, not Tailwind's",
  /--default-transition-duration:\s*var\(--dg-duration/.test(css) &&
    /--default-transition-timing-function:\s*var\(--ease-/.test(css),
  "1,174 of the prototype's transitions are 300ms ease-out. Binding the defaults means a bare `transition-colors` is already right and nobody has to remember a duration class.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  Type and focus");

const layoutFiles = filesUnder(join(SRC, "app"), [".tsx"]);
const fontsLoaded = new Set();
for (const f of layoutFiles) {
  for (const m of stripComments(readFileSync(f, "utf8")).matchAll(
    /import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/g,
  )) {
    for (const name of m[1].split(",")) fontsLoaded.add(name.trim());
  }
}
check(
  `Inter is the only typeface loaded (${[...fontsLoaded].join(", ") || "none"})`,
  fontsLoaded.size === 1 && fontsLoaded.has("Inter"),
  "7,721 of the design's 7,733 text runs are Inter. A second webfont is a second network request and a second set of metrics for the same page.",
);
check(
  "--font-sans is bound to the loaded font",
  /--font-sans:\s*var\(--font-inter\)/.test(css),
  "Otherwise `font-sans` resolves to the system stack and the page renders in a font nobody chose, only on the machines that lack Inter.",
);

check(
  "a single global focus style exists",
  /:focus-visible\s*\{[^}]*outline:/.test(css),
  "The previous project styled focus per component and shipped controls that could be tabbed to and not seen.",
);
const focusKillers = componentCode.filter(([, s]) =>
  /\boutline-none\b|outline:\s*none/.test(s),
);
check(
  "nothing removes the focus outline",
  focusKillers.length === 0,
  `Removing the outline is only acceptable with a replacement in the same rule, and this is the wrong place to have that argument — take it up in Phase 3 with the primitive that needs it.\n      ${focusKillers.map(([f]) => rel(f)).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  Primitives (Plan.md §8, Phase 3)");

const UI_DIR = join(SRC, "components", "ui");
const uiFiles = filesUnder(UI_DIR, [".tsx", ".ts"]);
const uiCode = new Map(uiFiles.map((f) => [f, stripComments(readFileSync(f, "utf8"))]));

// Physical directions in a kit that has to work in both. `translate-x` is
// allowed and is the one exception: transforms have no logical form, and the
// two places that need one parameterise the direction instead.
const PHYSICAL =
  /\b(?:pl|pr|ml|mr|left|right|border-l|border-r|rounded-l|rounded-r|inset-l|inset-r)-|\btext-(?:left|right)\b/;
const physical = uiFiles.filter((f) => PHYSICAL.test(uiCode.get(f) ?? ""));
check(
  `no primitive uses a physical direction (${uiFiles.length} files)`,
  physical.length === 0,
  `\`ps\`/\`pe\`, \`ms\`/\`me\`, \`start\`/\`end\`, \`text-start\`. Nothing here proves itself while the app ships two left-to-right languages — the point is that the kit does not have to be re-audited the first time it does not.\n      ${physical.map(rel).join("\n      ")}`,
);

const clickableDivs = uiFiles.filter((f) =>
  /<(?:div|span|p|li)\b[^>]*\sonClick/.test(uiCode.get(f) ?? ""),
);
check(
  "no primitive puts a click handler on a non-interactive element",
  clickableDivs.length === 0,
  `A \`div\` with an onClick cannot be tabbed to, cannot be activated with Space or Enter, and is announced as nothing. If it is pressable it is a \`button\`.\n      ${clickableDivs.map(rel).join("\n      ")}`,
);

// Behaviour worth not reimplementing: focus traps, roving tab indexes,
// typeahead, inert backgrounds, `aria-expanded` wiring. Naming them here means
// a later "simplification" back to a div has to argue with this list.
const RADIX_BACKED = {
  "Modal.tsx": "Dialog",
  "Drawer.tsx": "Dialog",
  "Tooltip.tsx": "Tooltip",
  "Select.tsx": "Select",
  "DropdownMenu.tsx": "DropdownMenu",
  "Tabs.tsx": "Tabs",
  "Accordion.tsx": "Accordion",
  "Checkbox.tsx": "Checkbox",
  "Radio.tsx": "RadioGroup",
  "Switch.tsx": "Switch",
  "Avatar.tsx": "Avatar",
};
const notBacked = Object.entries(RADIX_BACKED).filter(([file, primitive]) => {
  const code = uiCode.get(join(UI_DIR, file));
  return (
    !code ||
    !/from "radix-ui"/.test(code) ||
    !new RegExp(`\\b${primitive}\\b`).test(code)
  );
});
check(
  `the primitives with non-trivial behaviour are built on Radix (${Object.keys(RADIX_BACKED).length})`,
  notBacked.length === 0,
  `Each of these is a keyboard contract, not a shape. Hand-rolling one produces something that looks finished and cannot be operated without a mouse.\n      ${notBacked.map(([f, p]) => `${f} (${p})`).join("\n      ")}`,
);

const missingDirective = [];
// Every component, not only the primitives. A section that quietly uses
// `useState` without the directive fails at the first page that renders it,
// with an error pointing at the page rather than at the file.
//
// It read `uiCode` here until Phase 6, which is a map of `components/ui` only —
// so for every file outside that directory the source was the empty string, no
// hook matched, and the rule passed by looking at nothing. It had been blind to
// `components/layout`, `app/` and `features/` since Phase 3. Same shape of bug
// as the comment stripper in Phase 5: a guard that reports a pass it never
// tested is worse than no guard, because it is also a claim.
const sourceOf = new Map(componentCode);
for (const f of componentFiles.filter((x) => x.endsWith(".tsx"))) {
  const code = sourceOf.get(f) ?? "";
  const usesHooks =
    /\buse(?:State|Effect|Id|Ref|Reducer|Context|Transition|SyncExternalStore|Memo|Callback)\s*\(/.test(
      code,
    );
  const radixNames = [
    ...code.matchAll(/import\s*\{([^}]+)\}\s*from\s*"radix-ui"/g),
  ].flatMap((m) => m[1].split(",").map((n) => n.trim().split(/\s+as\s+/)[0]));
  // `Slot` only clones its child and carries no client directive of its own, so
  // a primitive that uses nothing else from Radix stays renderable on the server.
  const needsClient = usesHooks || radixNames.some((n) => n !== "Slot");
  const declared = /^\s*["']use client["']/m.test(code);
  if (needsClient && !declared) missingDirective.push(rel(f));
}
check(
  `every component that needs the client says so (${componentFiles.filter((x) => x.endsWith(".tsx")).length} files)`,
  missingDirective.length === 0,
  `Without the directive the component is rendered on the server, where its hooks and its Radix context do not exist. The failure is a build error at the first page that uses it, pointing at the page rather than at this file.\n      ${missingDirective.join("\n      ")}`,
);

const galleryPath = join(SRC, "app", "[locale]", "primitives", "Gallery.tsx");
if (existsSync(galleryPath)) {
  // Imports removed first: a primitive that is imported and then not rendered is
  // exactly the case this rule is looking for, and the import alone would
  // satisfy a naive search.
  const gallery = stripComments(readFileSync(galleryPath, "utf8")).replace(
    /\bimport\s[^;]*?;/gs,
    "",
  );
  const notShown = uiFiles.filter((f) => {
    const exported = [
      ...(uiCode.get(f) ?? "").matchAll(/export\s+(?:function|const)\s+(\w+)/g),
    ].map((m) => m[1]);
    // Rendered or called, not merely mentioned. A section heading that names the
    // primitive — "Card · Skeleton · Avatar · Rating" — is not the primitive
    // being on the page.
    return (
      exported.length > 0 &&
      !exported.some((name) =>
        new RegExp(`<${name}\\b|\\b${name}\\s*\\(`).test(gallery),
      )
    );
  });
  check(
    `every primitive appears in the gallery (${uiFiles.length} files)`,
    notShown.length === 0,
    `A primitive nobody has looked at is a primitive nobody has tested. The gallery is the only place every state of every control is rendered at once.\n      ${notShown.map(rel).join("\n      ")}`,
  );
} else {
  check("the primitives gallery exists", false, `Expected ${rel(galleryPath)}.`);
}

// `cn` restates the scales so that tailwind-merge can tell a size from a
// colour. That duplication cannot be removed — it is a JS module and the scale
// is CSS — so it is checked instead.
const cnCode = stripComments(readFileSync(join(SRC, "lib", "cn.ts"), "utf8"));
const listIn = (name) =>
  new Set(
    [
      ...(
        cnCode.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\]`))?.[1] ?? ""
      ).matchAll(/"([^"]+)"/g),
    ].map((m) => m[1]),
  );
const tokensNamed = (ns) =>
  new Set(
    [...themeTokens.keys()]
      .filter(
        (t) =>
          t.startsWith(`--${ns}-`) && !t.endsWith("-*") && !t.slice(2).includes("--"),
      )
      .map((t) => t.slice(ns.length + 3)),
  );
for (const [listName, ns] of [
  ["COLOURS", "color"],
  ["TYPE", "text"],
  ["RADII", "radius"],
  ["SHADOWS", "shadow"],
]) {
  const declared = listIn(listName);
  const actual = tokensNamed(ns);
  const missing = [...actual].filter((v) => !declared.has(v));
  const extra = [...declared].filter((v) => !actual.has(v));
  check(
    `cn() knows every --${ns} token (${actual.size})`,
    missing.length === 0 && extra.length === 0,
    `A token missing from lib/cn.ts does not fail the build. It merges wrong — \`cn("text-14 text-ink", "text-16")\` silently drops the colour instead of the size — on the one component where it mattered.\n      missing from cn.ts: ${missing.join(", ") || "none"}\n      unknown to globals.css: ${extra.join(", ") || "none"}`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section("§7  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:design"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} design assertions passed\x1b[0m\n`);
