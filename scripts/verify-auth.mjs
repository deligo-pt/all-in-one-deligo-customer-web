#!/usr/bin/env node
/**
 * Phase 6 guard — the sign-in flow.
 *
 * Two things make this phase easy to get quietly wrong, and both are what the
 * assertions below are about.
 *
 * The first is duplication. The design puts sign-in in two places — a drawer
 * over any page, and a `/login` screen — and the obvious way to build that is
 * twice. Two copies of a flow do not stay identical; they drift on the state
 * nobody looks at, which for auth is the error path. So the rules here are
 * about there being **one** panel with two mounts.
 *
 * The second is that nothing is connected yet. A form that cannot submit is
 * indistinguishable, in review, from a form that submits and silently does
 * nothing — and shipping the second is the specific failure this rebuild
 * exists to not repeat. So the rules are also about the seam: one transport,
 * every method failing, no network call anywhere in the feature, and no token
 * storage invented before Phase 15 decides where tokens live.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DEV_ONLY_ROUTES } from "./dev-only-routes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FEATURE = join(SRC, "features", "auth");
const LAYOUT = join(SRC, "components", "layout");

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

/** Same character-walking stripper as the other four guards, kept identical on
 *  purpose: a rule about code must not be satisfied — or broken — by prose.
 *  This file's own doc comment quotes `one-time-code`. */
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

const featureFiles = filesUnder(FEATURE);
const srcFiles = filesUnder(SRC);
const code = new Map(srcFiles.map((f) => [f, stripComments(readFileSync(f, "utf8"))]));

const panel = read(join(FEATURE, "AuthPanel.tsx"));
const otpInput = read(join(FEATURE, "OtpInput.tsx"));
const otpField = read(join(FEATURE, "OtpInput.tsx"));
const flow = read(join(FEATURE, "useAuthFlow.ts"));
const types = read(join(FEATURE, "types.ts"));
const transport = read(join(FEATURE, "transport.ts"));
const loginPage = read(join(SRC, "app", "[locale]", "(auth)", "login", "page.tsx"));
const drawer = read(join(LAYOUT, "SignInDrawer.tsx"));
const button = read(join(LAYOUT, "SignInButton.tsx"));
const header = read(join(LAYOUT, "SiteHeader.tsx"));

// ─────────────────────────────────────────────────────────────────────────────
section("§1  One flow, two mounts");

check(
  "the feature exists",
  featureFiles.length > 0 && panel.length > 0 && flow.length > 0,
  `Expected ${rel(join(FEATURE, "AuthPanel.tsx"))} and ${rel(join(FEATURE, "useAuthFlow.ts"))}.`,
);

const flowCallers = [...code]
  .filter(([f]) => f !== join(FEATURE, "useAuthFlow.ts"))
  .filter(([, s]) => /\buseAuthFlow\s*\(/.test(s))
  .map(([f]) => rel(f));
check(
  `exactly one component drives the flow (${flowCallers.join(", ") || "none"})`,
  flowCallers.length === 1 && flowCallers[0].endsWith("AuthPanel.tsx"),
  "The design draws sign-in twice — as a drawer and as a page. A second caller of `useAuthFlow` is a second copy of the flow, and two copies drift on the path nobody exercises, which for authentication is the error path.",
);

for (const [name, source] of [
  ["/login", loginPage],
  ["SignInDrawer", drawer],
]) {
  check(
    `${name} renders the panel rather than its own form`,
    /<AuthPanel\b/.test(source),
    "Both places the design shows sign-in must render the same component. A page that lays out its own fields looks identical on the day it is written and diverges on every day after.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
section("§2  The network and the session are someone else's");

const NETWORK = /\bfetch\s*\(|\baxios\b|XMLHttpRequest|navigator\.sendBeacon/;
const callers = featureFiles.filter((f) => NETWORK.test(code.get(f) ?? ""));
check(
  `no file in the feature makes a network call of its own (${featureFiles.length} files)`,
  callers.length === 0,
  `Since Phase 15 requests go through the session client (\`@/services/session/browser\`). A request placed here directly is one the API layer does not know about — no interceptor, no token refresh, no error normalisation.\n      ${callers.map(rel).join("\n      ")}`,
);

const METHODS = ["requestOtp", "verifyOtp", "socialLogin"];
const missingMethods = METHODS.filter((m) => !new RegExp(`\\b${m}\\b`).test(types));
check(
  `the transport contract names every auth endpoint the old app proved (${METHODS.join(", ")})`,
  missingMethods.length === 0,
  `Plan.md §2.2: \`/auth/login-customer\`, \`/auth/verify-otp\`, \`/auth/social-login\`. A contract missing one of them is a screen Phase 15 will have to redesign around.\n      ${missingMethods.join(", ")}`,
);

const rejects = (transport.match(/Promise\.reject\(/g) ?? []).length;
check(
  `every method of the offline transport fails (${rejects}/${METHODS.length} reject)`,
  rejects >= METHODS.length,
  "A stub that resolves is a sign-in that appears to work. The customer sees success, no session exists, and the next page is a logged-out one — which is exactly the class of bug this rebuild exists to stop shipping.",
);

const STORAGE = /localStorage|sessionStorage|document\.cookie|indexedDB/;
const storers = featureFiles.filter((f) => STORAGE.test(code.get(f) ?? ""));
check(
  "the feature stores no credential of its own",
  storers.length === 0,
  `Phase 15 decided: cookies written by \`/api/session\`, through \`saveSession\`. A token written here would be a second store that nothing else reads or clears.\n      ${storers.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  The panel is not on every route's critical path");

for (const [name, source] of [
  ["SiteHeader.tsx", header],
  ["SignInButton.tsx", button],
]) {
  const statik = [...source.matchAll(/from\s+"(@\/features\/[^"]+)"/g)].map(
    (m) => m[1],
  );
  check(
    `${name} does not import the feature statically`,
    statik.length === 0,
    `A feature's barrel hands every importer every export, and the header is imported by every route in the application. Measured in this phase: 27 KB gzipped on all seventy-two pages, for a panel almost none of them open. The way in is \`dynamic()\`.\n      ${statik.join(", ")}`,
  );
}

check(
  "the drawer is reached through a split point",
  /dynamic\(\s*\(\)\s*=>\s*import\("\.\/SignInDrawer"\)/.test(button),
  "Without it the Radix dialog, the focus trap and the whole panel are downloaded by everyone who loads a page with a header — which is everyone.",
);

check(
  "the device-limit dialog is loaded when it is needed",
  /dynamic\(\s*\(\)\s*=>\s*import\("\.\/DeviceLimitDialog"\)/.test(panel) &&
    !/from\s+"\.\/DeviceLimitDialog"/.test(panel),
  "It is a second Radix dialog, shown only to somebody already signed in on the maximum number of devices. Loading it with the panel put `/login` over the first-load budget on its own.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  The contracts that make it usable");

const conditions = [
  ...(flow.match(/export type AuthCondition =([\s\S]*?);/)?.[1] ?? "").matchAll(
    /"(\w+)"/g,
  ),
].map((m) => m[1]);
const unmapped = conditions.filter((c) => !new RegExp(`\\b${c}:\\s*"`).test(panel));
check(
  `every condition the flow raises has a sentence (${conditions.length} conditions)`,
  conditions.length > 0 && unmapped.length === 0,
  `The hook names what happened and the panel says it. A condition with no entry in the mapping renders nothing at all — the customer presses a button and the screen does not change.\n      ${unmapped.join(", ")}`,
);

check(
  "the notice is announced, not just displayed",
  /aria-live=/.test(panel),
  "Every message this panel produces is the answer to something the customer just did. Without a live region a screen-reader user presses Send and hears silence, whether it worked or not.",
);

check(
  "the code field accepts the one-time code the device already has",
  // Scoped to the feature rather than to `AuthPanel`, because the design's
  // six boxes moved the field into `OtpInput`. Where it is written is not the
  // claim; that a customer never retypes a code they have already received is.
  /autoComplete=\{?index === 0 \? "one-time-code"|autoComplete="one-time-code"/.test(
    panel + otpField,
  ),
  "It is what makes iOS and Android offer the code straight from the SMS notification. Without it, everybody retypes six digits from another app.",
);

check(
  "the code length is one number, and it is the backend's",
  // Phase 15, first real sign-in: the design draws six boxes, the API sends
  // four digits. Six hard-coded in three places is how that shipped.
  /export const OTP_LENGTH = 4;/.test(otpInput) &&
    /slice\(0, OTP_LENGTH\)/.test(read(join(FEATURE, "useAuthFlow.ts"))) &&
    ![otpInput, panel, read(join(FEATURE, "useAuthFlow.ts"))].some((src) =>
      /slice\(0, \d\)|length: \d\b|< \d\)/.test(src),
    ) &&
    ["en", "pt"].every(
      (l) =>
        !/\b[46] ?-?(digit|dígitos)/.test(
          readFileSync(join(SRC, "i18n", "dictionaries", l, "auth.ts"), "utf8"),
        ),
    ),
  "Two boxes that can never be filled and a Verify button that never enables. The boxes, the input limit, the button and the copy must read one constant.",
);

check(
  "a pasted code fills the whole field",
  /onPaste=/.test(otpField),
  "Six separate boxes are the normal way to break paste: the browser drops the whole code into the first one and the other five stay empty. The design draws six, so the paste has to be handled rather than inherited.",
);

check(
  "the way to the other identifier sits with the other providers",
  // The design has no tab bar: phone is the default, and "Continue with
  // Email" is the third button under Google and Facebook. Freezing it here
  // because a tab bar is the obvious thing to reach for, it was what this
  // panel had first, and it costs 9 KB of Radix that this layout does not use.
  /continueWithEmail/.test(panel) &&
    /continueWithPhone/.test(panel) &&
    !/from "@\/components\/ui\/Tabs"/.test(panel),
  "Phone and email are two ways to identify yourself, and so are Google and Facebook. The design puts all four in one list; a tab bar above a provider list says they are different kinds of thing.",
);

/**
 * The rule is about the dial code as a *constant* — the thing that has to
 * change when DeliGo serves a second country — not about the characters
 * `+351` appearing anywhere.
 *
 * Phase 12 transcribed the design's sample phone number, "+351 912 345 678",
 * into a development fixture and this fired. The fixture is a picture of a
 * Figma frame on a page that 404s in production; it defines nothing and
 * nothing reads a dial code out of it. Flagging it would have taught the next
 * person to change the design's own number to keep a guard quiet, which is the
 * guard winning an argument it should not have been in.
 *
 * Sample content on a development-only page is exempt. Everything else — every
 * component, every route, every shipping module — still is not.
 */
const isDevFixture = (f) =>
  DEV_ONLY_ROUTES.some((name) => rel(f).includes(`${sep}${name}${sep}`));

const dialCodeElsewhere = [...code]
  .filter(([f]) => f !== join(FEATURE, "countries.ts"))
  .filter(([f]) => !isDevFixture(f))
  .filter(([, s]) => /\+351/.test(s))
  .map(([f]) => rel(f));
check(
  "the dial code is written in one place",
  dialCodeElsewhere.length === 0,
  `\`countries.ts\` joins it onto the number, because the API takes one string. A second copy is the one that does not change when DeliGo serves a second country.\n      ${dialCodeElsewhere.join("\n      ")}`,
);

const marks = ["google", "facebook"].map((n) =>
  join(ROOT, "public", "brand", `${n}.svg`),
);
check(
  "the provider marks are assets, not components",
  marks.every((f) => existsSync(f)),
  `Google and Facebook both mandate their exact artwork and colours. Keeping them in \`public/brand/\` is what lets \`verify:design\` go on forbidding a colour literal anywhere under \`src/\` without an exception carved into it.\n      ${marks
    .filter((f) => !existsSync(f))
    .map(rel)
    .join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:auth"),
  "A guard nothing calls passes forever.",
);

// ─────────────────────────────────────────────────────────────────────────────
console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} auth assertions passed\x1b[0m\n`);
