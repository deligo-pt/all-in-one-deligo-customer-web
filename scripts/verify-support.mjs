#!/usr/bin/env node
/**
 * Phase 20h guard — support, from every page.
 *
 * The old app mounts its chat panel in the `(main)` layout so that asking a
 * question never costs the page you were on. This app had one support *page*,
 * which meant a customer stuck in checkout had to leave checkout to ask about
 * checkout. The panel now lives in the locale layout and opens over whatever
 * is on screen.
 *
 * ## The three things this defends
 *
 * **1. A button on every page must cost nothing.** The launcher is rendered on
 * every route in the app. It reads no ticket list and no unread count: the
 * backend answers in 0.75–1.2 s and the panel is opened by almost nobody, so
 * the first request is the first press. A guard, because "just fetch the
 * unread badge" is a one-line change that would put a third request on every
 * page in the product.
 *
 * **2. The topic ids must never travel.** `category` on a support ticket is
 * write-once — measured on the old app's account: `GENERAL → ORDER_ISSUE` is
 * honoured and every later change is ignored — and a customer cannot close
 * their own ticket (403). So after the first conversation the category is
 * frozen and says nothing about what this one is about. What reaches a person
 * is the sentence, which is why a topic writes words rather than sending an
 * id, and why nothing is sent until Send is pressed.
 *
 * **3. Opening support must not navigate.** The whole phase is that the page
 * survives the question. An opener that links to `/account/support` would pass
 * a casual reading of "support opens from any page" and fail the point of it.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
const load = (f) => import(pathToFileURL(join(SRC, f)).href);

const WIDGET = join(SRC, "components", "shared", "SupportWidget.tsx");
const DIALOG = join(SRC, "components", "shared", "SupportDialog.tsx");
const OPENER = join(SRC, "components", "shared", "SupportOpener.tsx");
const TRANSPORT = join(SRC, "services", "support", "browser.ts");
const COPY = join(SRC, "services", "support", "copy.ts");
const LAYOUT = join(SRC, "app", "[locale]", "layout.tsx");

const widget = read(WIDGET);
const dialog = read(DIALOG);
const opener = read(OPENER);
const transport = read(TRANSPORT);
const copySource = read(COPY);
const layout = read(LAYOUT);
const events = read(join(SRC, "lib", "events.ts"));

const lib = await load("lib/support.ts");
const en = (await load("i18n/dictionaries/en/support.ts")).default;
const pt = (await load("i18n/dictionaries/pt/support.ts")).default;
const { ICONS } = await load("lib/icons.ts");

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The panel is on every page, and opening it never navigates");

check(
  "the locale layout mounts the widget",
  /<SupportWidget\b/.test(layout),
  `Expected ${rel(LAYOUT)} to mount it, the way the old app mounts its chat in (main)/layout.tsx.`,
);
check(
  "🔴 and it is the layout that mounts it, not a page",
  filesUnder(join(SRC, "app")).filter((f) => /<SupportWidget\b/.test(read(f)))
    .length === 1,
  "Mounted per page, a navigation mid-conversation unmounts the conversation.",
);
check(
  "🔴 an opener dispatches an event rather than linking away",
  /\bdispatchEvent\(/.test(opener) &&
    !/href=/.test(opener) &&
    !/next\/link/.test(opener),
  `A link to /account/support would leave the page the question is about. ${rel(OPENER)}`,
);
check(
  "the event's name lives in lib/, not in a feature",
  /SUPPORT_EVENT/.test(events) &&
    /@\/lib\/events/.test(widget) &&
    /@\/lib\/events/.test(opener),
  "A name exported from a feature barrel drags that feature's views into the layout — this project has paid for that three times.",
);
check(
  "the conversation is split out of every route's bundle",
  /dynamic\(/.test(widget) &&
    /ssr:\s*false/.test(widget) &&
    /import\("\.\/SupportDialog"\)/.test(widget),
  "Statically imported, every route in the app pays for a dialog, a textarea and a transport.",
);
check(
  "it is mounted only once opened",
  /\{open \?\s*\(\s*<SupportDialog/.test(widget),
  "A closed panel that stays mounted keeps its ten-second poll running.",
);
check(
  "the push toast does not sit on top of the launcher",
  /bottom-20/.test(read(join(SRC, "components", "shared", "PushListener.tsx"))) &&
    /bottom-4/.test(widget),
  "Both were bottom-end; the toast now sits above the button rather than over it.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  🔴 A button on every page costs no requests");

check(
  "the widget holds no transport",
  !/services\/support\/browser/.test(widget),
  "The launcher is on every route; a read here is a request on every page.",
);
check(
  "the first read happens on the first opening",
  /if \(!open\) return;/.test(dialog) && /void load\(\)/.test(dialog),
  `The read belongs inside the ${"`open`"} effect in ${rel(DIALOG)}.`,
);
check(
  "🔴 the panel never indexes `unreadCount`",
  ![widget, dialog, transport, read(join(SRC, "lib", "support.ts"))].some((source) =>
    /unreadCount\s*\[|unreadCount\?\.\[/.test(source),
  ),
  "It is keyed by recipient, so reading it needs the customer's own userId — a second request on every page in the app, for a number that is currently always zero. `/account/support` reads it and is welcome to: that page already holds the profile. The launcher does not, and must not fetch one.",
);
check(
  "the poll is the old app's ten seconds, and it stops with the panel",
  /REFRESH_MS = 10_000/.test(dialog) && /clearInterval\(timer\)/.test(dialog),
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  A guest gets no button, and no dialog that cannot work");

check(
  "🔴 nothing renders without a session",
  /if \(!signedIn\) return null;/.test(widget),
  "Every support endpoint needs a token. A button that opens a dialog that can only say 'sign in first' is a button that lies.",
);
check(
  "an opener fired by a guest goes to sign in",
  /if \(!hasSession\(\)\)\s*\{\s*router\.push\(loginHref\)/.test(widget),
);
check(
  "the session is watched, not read once",
  /return subscribeSession\(/.test(widget),
  "Importing it is not subscribing to it: signing in on the page must bring the button with it, and an unsubscribe must be returned or the listener outlives the panel.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  🔴 The topic writes words; the id never travels");

check(
  "sending posts the message and nothing else",
  /post\("\/support\/send-message", \{ message \}\)/.test(transport),
  "A `category` or a topic id here would put a machine token in front of a person, and would be ignored anyway on every ticket after the first.",
);
check(
  "no topic id is anywhere near a request",
  !/REFUND_STATUS|UNRECOGNIZED_CHARGE|ORDER_LATE/.test(transport),
);
check(
  "a topic fills the composer instead of sending",
  /onPick\(/.test(dialog) && !/onPick[\s\S]{0,200}sendMessage/.test(dialog),
  "Nothing is sent until Send is pressed — the old app's rule.",
);
check(
  "the sentence is built by the shared function",
  /buildTopicPrefill\(/.test(dialog),
);
check(
  "the payment screen types the same sentence a topic row does",
  /prefillPayment/.test(read(join(SRC, "services", "checkout", "copy.ts"))),
  "A payment question should read the same to an agent however it was started.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The model, executed");

const { buildTopicPrefill, normalizeOutgoingMessage, activeTicket, chronological, isOutgoing } =
  lib;

check(
  "both halves make one sentence",
  buildTopicPrefill("Payment Question", "Unrecognized Charge") ===
    "Payment Question: Unrecognized Charge",
  "This exact string is what the old app types.",
);
check(
  "🔴 a missing half is not a dangling separator",
  buildTopicPrefill("Payment Question", "") === "Payment Question" &&
    buildTopicPrefill("", "Refund Status") === "Refund Status" &&
    buildTopicPrefill("  ", "  ") === null,
  'A dictionary that has lost both keys must open the composer empty, not type ": " at the customer.',
);
check(
  "whitespace is not a message",
  normalizeOutgoingMessage("   ") === null &&
    normalizeOutgoingMessage("") === null &&
    normalizeOutgoingMessage(null) === null &&
    normalizeOutgoingMessage("  hi ") === "hi",
  "The API's only rule is `min 1` and it does not trim: three spaces are accepted and reach an agent as an empty grey bubble.",
);
check(
  "🔴 a closed ticket is not the open one",
  activeTicket([
    { ticketId: "TIC-1", status: "CLOSED", lastMessageTime: "2026-09-20T10:00:00Z" },
    { ticketId: "TIC-2", status: "OPEN", lastMessageTime: "2026-09-19T10:00:00Z" },
  ])?.ticketId === "TIC-2",
);
check(
  "an unknown status is treated as live",
  activeTicket([{ ticketId: "TIC-3", status: "IN_PROGRESS" }])?.ticketId === "TIC-3",
  "A whitelist of OPEN would hide a live ticket from the customer sitting in it the day the backend adds a status.",
);
check(
  "the newest by activity wins, not by creation",
  activeTicket([
    { ticketId: "OLD", createdAt: "2026-09-01T00:00:00Z", lastMessageTime: "2026-09-20T00:00:00Z" },
    { ticketId: "NEW", createdAt: "2026-09-19T00:00:00Z" },
  ])?.ticketId === "OLD",
);
check(
  "nothing to show is null, not a crash",
  activeTicket(null) === null && activeTicket([]) === null && activeTicket([{}]) === null,
);
check(
  "🔴 the thread reads oldest first, whatever order it arrived in",
  // Three, deliberately: with two, a `.reverse()` produces the same answer as
  // a sort and the assertion proves nothing. (Found by mutating this file.)
  chronological([
    { _id: "b", createdAt: "2026-09-20T10:05:00Z" },
    { _id: "a", createdAt: "2026-09-20T10:00:00Z" },
    { _id: "c", createdAt: "2026-09-20T10:10:00Z" },
  ]).map((m) => m._id).join("") === "abc",
  "`GET …/messages` answers newest-first and pages that way, so page 2 is older than page 1: a reverse would be right for one page and wrong for two.",
);
check(
  "it never mutates what it was given",
  (() => {
    const input = [
      { _id: "b", createdAt: "2026-09-20T10:05:00Z" },
      { _id: "a", createdAt: "2026-09-20T10:00:00Z" },
      { _id: "c", createdAt: "2026-09-20T10:10:00Z" },
    ];
    chronological(input);
    return input.map((m) => m._id).join("") === "bac";
  })(),
  "The array it is handed is the transport's own response, and a sort in place would reorder a thread somebody else is already rendering.",
);
check(
  "a message with no usable date sorts last",
  chronological([
    { _id: "pending" },
    { _id: "real", createdAt: "2026-09-20T10:00:00Z" },
  ]).map((m) => m._id).join("") === "realpending",
  "The realistic source of one is a message still on its way out, and the bottom of the thread is where it belongs.",
);
check(
  "mine is mine",
  isOutgoing({ senderRole: "CUSTOMER" }) === true &&
    isOutgoing({ senderRole: "ADMIN" }) === false &&
    isOutgoing(null) === false,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§6  Every topic has words, in both languages, and an icon");

const keys = lib.SUPPORT_SECTIONS.flatMap((s) => [
  s.titleKey,
  s.prefillKey,
  ...s.topics.map((t) => t.labelKey),
]);
const missing = keys.filter((k) => !(k in en) || !(k in pt));
check(
  "🔴 every section and topic key exists in English and Portuguese",
  missing.length === 0,
  `Missing: ${missing.join(", ")}. A missing key renders its own name at the customer — t() does not throw.`,
);
const badIcons = lib.SUPPORT_SECTIONS.flatMap((s) => s.topics)
  .map((t) => t.icon)
  .filter((icon) => !(icon in ICONS));
check(
  "every topic's icon is in the registry",
  badIcons.length === 0,
  `Not registered: ${badIcons.join(", ")}`,
);
check(
  "the copy builder fills every field the panel declares",
  (() => {
    const declared = (widget.match(/export type SupportPanelCopy = \{([\s\S]*?)\n\};/) ?? [])[1] ?? "";
    const fields = [...declared.matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
    return fields.length > 10 && fields.every((f) => new RegExp(`\\b${f}:\\s*t\\(`).test(copySource));
  })(),
  `Every field of SupportPanelCopy must be resolved in ${rel(COPY)}.`,
);
check(
  "the namespace is registered everywhere it has to be",
  (() => {
    const ns = read(join(SRC, "i18n", "namespaces.ts"));
    const parity = read(join(SRC, "i18n", "keyParity.ts"));
    return (
      /"support",/.test(ns) &&
      /support: typeof supportEn;/.test(ns) &&
      /import\("\.\/dictionaries\/en\/support"\)/.test(ns) &&
      /import\("\.\/dictionaries\/pt\/support"\)/.test(ns) &&
      /supportEn/.test(parity)
    );
  })(),
  "Two dictionaries, one line in NAMESPACES, one in Dictionary, a loader per locale, and the parity pair. Miss one and a namespace exists in one language only — which t() answers with the key itself.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§7  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:support"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} support assertions passed\x1b[0m\n`);
