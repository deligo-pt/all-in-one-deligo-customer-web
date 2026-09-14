#!/usr/bin/env node
/**
 * Phase 15 guard — the session.
 *
 * The pure rules are **executed** (Node strips the types): which 401s end a
 * session, where `next` may point, which cookie script can read. The wiring is
 * read from source: who may write a cookie, where axios may load, which
 * requests are same-origin only.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
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
const load = (f) => import(pathToFileURL(join(SRC, f)).href);

const session = await load("lib/session.ts");
const apiError = await load("lib/apiError.ts");
const routes = await load("lib/routes.ts");

const jwt = (exp) =>
  `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.sig`;

// ─────────────────────────────────────────────────────────────────────────────
section("§1  The rules, executed");

check(
  "only the session's own 401s end it",
  session.isSessionEnded(401, "NOT_AUTHORIZED") &&
    session.isSessionEnded(401, "AUTHENTICATION_REQUIRED") &&
    session.isSessionEnded(401, undefined) &&
    !session.isSessionEnded(401, "INVALID_OTP_CODE") &&
    !session.isSessionEnded(403, "LIMIT_EXCEEDED"),
  "A mistyped OTP digit is a 401 too. The old app once signed customers out for it, mid-form.",
);

check(
  "`next` can only point at this site",
  session.safeNextPath("/en/cart") === "/en/cart" &&
    ["//evil.com", "https://evil.com", "/\\evil.com", "", null].every(
      (v) => session.safeNextPath(v) === null,
    ),
  "A sign-in page that forwards to any URL it is given is an open redirect with our name on it.",
);

const exp = Math.floor(Date.now() / 1000) + 3600;
const cookies = session.sessionCookies(
  { accessToken: jwt(exp), refreshToken: jwt(exp + 60) },
  true,
);
const byName = Object.fromEntries(cookies.map((c) => [c.name, c.options]));
check(
  "the refresh token is httpOnly, the access token is not, and both expire with their JWT",
  byName[session.REFRESH_TOKEN_COOKIE]?.httpOnly === true &&
    byName[session.ACCESS_TOKEN_COOKIE]?.httpOnly === false &&
    byName[session.ACCESS_TOKEN_COOKIE]?.expires?.getTime() === exp * 1000 &&
    cookies.every((c) => c.options.secure && c.options.sameSite === "lax"),
  "Script needs the access token to send it; nothing in the page needs the refresh token, so nothing in the page can steal it.",
);

check(
  "a response is a session only if it carries real JWTs",
  session.readTokens({ accessToken: jwt(exp), refreshToken: jwt(exp) })?.refreshToken &&
    session.readTokens({ accessToken: "not-a-jwt" }) === null &&
    session.readTokens(null) === null,
  "`success: true` with an unexpected shape stored as a session is a signed-in customer whose every request fails.",
);

const wrapped = apiError.normaliseFailure(
  400,
  {
    message: "Validation failed. Please check…",
    errorSources: [
      { path: "otp", message: { en: "otp is required.", pt: "otp é obrigatório." } },
    ],
    err: { errorKey: "VALIDATION" },
  },
  "pt",
);
check(
  "error normalisation prefers the field's reason, in the requested language, and keeps the key",
  wrapped.message === "otp é obrigatório." &&
    wrapped.errorKey === "VALIDATION" &&
    wrapped.status === 400,
  "The wrapper sentence tells a customer nothing, and an `{ en, pt }` object reaching JSX throws.",
);

// The expectation is the guard's own, not read back from the code it checks:
// a rule that derives "which routes need a session" from `SIGNED_IN_GROUPS`
// agrees with any value that constant takes — the harness proved it.
const EXPECTED_GROUPS = ["account", "checkout"];
const all = Object.values(routes.ROUTES);
const shouldGuard = all.filter((r) => EXPECTED_GROUPS.includes(r.group));
const sample = (p) => p.replace(/\[[^\]]+\]/g, "sample-id");
const leaks = shouldGuard.filter((r) => !routes.requiresSession(sample(r.path)));
const overreach = all.filter(
  (r) => !EXPECTED_GROUPS.includes(r.group) && routes.requiresSession(sample(r.path)),
);
check(
  `every account and checkout route needs a session, and nothing else does (${shouldGuard.length})`,
  shouldGuard.some((r) => r.path === "/checkout") &&
    shouldGuard.some((r) => r.path === "/notifications") &&
    leaks.length === 0 &&
    overreach.length === 0 &&
    !routes.requiresSession("/accounting"),
  `Unguarded: ${leaks.map((r) => r.path).join(", ") || "none"} · over-guarded: ${overreach.map((r) => r.path).join(", ") || "none"}`,
);

check(
  "the session endpoints accept only this site's own requests",
  !session.isSameOrigin("https://evil.example", null, "http://localhost:3000") &&
    session.isSameOrigin("http://localhost:3000", null, "http://localhost:3000") &&
    session.isSameOrigin(null, "same-origin", "http://localhost:3000") &&
    !session.isSameOrigin(null, "cross-site", "http://localhost:3000") &&
    !session.isSameOrigin(null, null, "http://localhost:3000"),
  "Without it any site can post its own tokens here and sign a visitor into the attacker's account.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§2  One place writes the session");

const sessionRoute = read(join(SRC, "app", "api", "session", "route.ts"));
const refreshRoute = read(join(SRC, "app", "api", "session", "refresh", "route.ts"));
const proxy = read(join(SRC, "proxy.ts"));

const scriptWriters = [...code]
  .filter(([, s]) => /document\.cookie\s*=/.test(s))
  .map(([f]) => rel(f));
check(
  "no page script writes a cookie",
  scriptWriters.length === 0,
  `Cookies are written by \`/api/session\` and the proxy. A second writer is a second idea of the options.\n      ${scriptWriters.join("\n      ")}`,
);

const refreshReaders = [...code]
  .filter(([, s]) => /REFRESH_TOKEN_COOKIE/.test(s))
  .map(([f]) => rel(f))
  .filter(
    (f) =>
      !/^src\/(lib\/session\.ts|proxy\.ts|app\/api\/session\/)/.test(
        f.split(sep).join("/"),
      ),
  );
check(
  "the refresh token is handled only on the server",
  refreshReaders.length === 0,
  `It is httpOnly; code that tries to read it in the browser is code that silently gets nothing.\n      ${refreshReaders.join("\n      ")}`,
);

check(
  "both session handlers refuse other origins",
  (sessionRoute.match(/isSameOrigin\(/g) ?? []).length >= 1 &&
    /export function DELETE\([^)]*\)\s*\{\s*if \(!allowed\(request\)\)/.test(
      sessionRoute,
    ) &&
    /export async function POST\([^)]*\)\s*\{\s*if \(!allowed\(request\)\)/.test(
      sessionRoute,
    ) &&
    /isSameOrigin\(/.test(refreshRoute),
  "Login CSRF on POST, forced sign-out on DELETE, a refresh anyone can trigger.",
);

check(
  "the location endpoint refuses other origins too",
  /isSameOrigin\(/.test(read(join(SRC, "app", "api", "location", "route.ts"))),
  "Another site should not decide which restaurants a visitor is shown.",
);

check(
  "a stored session needs both tokens",
  /if \(!tokens\?\.refreshToken\) return new NextResponse\(null, \{ status: 400 \}\)/.test(
    sessionRoute,
  ),
  "An access token without its refresh token is a session that dies at its first expiry.",
);

check(
  "the proxy guards by route map and forwards only safe `next` paths",
  /requiresSession\(path\)/.test(proxy) &&
    /safeNextPath\(/.test(proxy) &&
    /refreshTokens\(refresh\)/.test(proxy) &&
    /request: \{ headers: request\.headers \}/.test(proxy),
  "Without the forwarded headers the page renders with the token the browser sent, not the one the proxy just refreshed.",
);

check(
  "a failed refresh ends the session instead of leaving half of one",
  /cookies\.delete\(REFRESH_TOKEN_COOKIE\)/.test(proxy) &&
    /status: 401/.test(refreshRoute) &&
    /cookies\.delete\(ACCESS_TOKEN_COOKIE\)/.test(refreshRoute),
  "A dead refresh cookie left in place is a failed refresh on every navigation from now on.",
);

// ─────────────────────────────────────────────────────────────────────────────
section("§3  One client, and it loads when it is used");

const creators = [...code]
  .filter(([, s]) => /axios\.create\(/.test(s))
  .map(([f]) => rel(f));
check(
  `one axios instance factory (${creators.length})`,
  creators.length === 1 && creators[0].endsWith(join("services", "api", "client.ts")),
  `Plan.md §3.3. Every other instance is one without the interceptors.\n      ${creators.join(", ")}`,
);

const featureNetwork = [...code]
  .filter(([f]) => f.startsWith(join(SRC, "features") + sep))
  .filter(([, s]) => /from "axios"|\bfetch\s*\(/.test(s))
  .map(([f]) => rel(f));
check(
  "no feature talks to the network except through the client",
  featureNetwork.length === 0,
  `No interceptor, no refresh, no error normalisation.\n      ${featureNetwork.join("\n      ")}`,
);

const HEAVY = /from "@\/services\/(session\/browser|api\/client)"/;
const staticHeavy = [...code]
  .filter(
    ([f]) =>
      f.startsWith(join(SRC, "features") + sep) ||
      f.startsWith(join(SRC, "components") + sep) ||
      f.startsWith(join(SRC, "hooks") + sep),
  )
  .filter(([, s]) => HEAVY.test(s))
  .map(([f]) => rel(f));
check(
  "axios reaches no component, hook or feature by static import",
  staticHeavy.length === 0,
  `Measured this phase: a static import through the sign-out button put axios on all seven account routes via the account barrel, and the transport put it on /login. Both now \`import()\` on use.\n      ${staticHeavy.join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§4  Sign-in and sign-out do things in the right order");

const transport = read(join(SRC, "features", "auth", "api.ts"));
const panel = read(join(SRC, "features", "auth", "AuthPanel.tsx"));
const browser = read(join(SRC, "services", "session", "browser.ts"));

check(
  "failures branch on errorKey — the device limit and all four social keys",
  [
    'LIMIT_EXCEEDED: "device-limit"',
    "SOCIAL_EMAIL_REQUIRED",
    "SOCIAL_ACCOUNT_ALREADY_LINKED",
    "GOOGLE_CONFIGURATION_MISSING",
    "FACEBOOK_CONFIGURATION_MISSING",
    "INVALID_SOCIAL_TOKEN",
  ].every((k) => transport.includes(k)) &&
    ![...code].some(
      ([f, s]) =>
        (f.includes(`${sep}auth${sep}`) || f.includes(`${sep}services${sep}`)) &&
        /message\.(includes|startsWith)\(|message ===/.test(s),
    ),
  '`LIMIT_EXCEEDED` reads "Request limit exceeded". Code that branches on prose breaks when someone rewords it.',
);

const completeBody = transport.slice(
  transport.indexOf("async function complete"),
  transport.indexOf("function identify"),
);
check(
  "push registration starts only after the session is saved",
  completeBody.indexOf("saveSession(") > -1 &&
    completeBody.indexOf("saveSession(") < completeBody.indexOf("requestPushToken("),
  "A permission prompt for a sign-in that failed is a question asked for nothing.",
);

check(
  "the panel is connected unless it is the offline states page",
  /offline \? notWiredTransport : apiAuthTransport/.test(panel) &&
    /<AuthPanel offline\b/.test(
      read(join(SRC, "app", "[locale]", "auth-states", "page.tsx")),
    ),
  "A states page on the connected transport sends a real code to whatever is typed in it.",
);

const endBody = browser.slice(
  browser.indexOf("export async function endSession"),
  browser.indexOf("export function deviceId"),
);
check(
  "sign-out frees the device slot before it clears the cookies",
  endBody.indexOf('"/auth/logout"') > -1 &&
    endBody.indexOf('"/auth/logout"') < endBody.indexOf('method: "DELETE"'),
  "The account allows three devices. The old app never called `/auth/logout`, so every browser sign-out kept its slot until the token expired.",
);

const accountPage = read(
  join(SRC, "app", "[locale]", "(account)", "account", "page.tsx"),
);
check(
  "sign-out is reachable when the profile cannot be read",
  /if \(!profile\)[\s\S]*?<SignOutButton\b[\s\S]*?return \(/.test(accountPage),
  "Found by hand on the first real sign-in: the button lived only in the profile view, the profile is not connected until Phase 20, and a signed-in customer had no way to sign out.",
);

check(
  "refreshing is single-flight",
  /refreshing \?\?= fetch\("\/api\/session\/refresh"/.test(browser),
  "Ten requests expiring together must share one refresh; ten refreshes race each other's rotated tokens.",
);

const literalConfig = filesUnder(ROOT + "/public", [".js"])
  .concat(filesUnder(SRC))
  .filter((f) => /AIza[0-9A-Za-z_-]{20,}/.test(readFileSync(f, "utf8")));
check(
  "the Firebase config comes from the environment, not a committed file",
  literalConfig.length === 0 &&
    /process\.env\.NEXT_PUBLIC_FIREBASE_PROJECT_ID/.test(
      read(join(SRC, "app", "firebase-messaging-sw.js", "route.ts")),
    ),
  `The old worker carried two projects' keys, one commented out.\n      ${literalConfig.map(rel).join("\n      ")}`,
);

// ─────────────────────────────────────────────────────────────────────────────
section("§5  The guard is wired in");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
check(
  "`pnpm verify` runs this script",
  (pkg.scripts?.verify ?? "").includes("verify:session"),
  "A guard nothing calls passes forever.",
);

console.log("");
if (failures.length) {
  console.error(`\x1b[31m✗ ${failures.length} failed, ${passed} passed\x1b[0m\n`);
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\x1b[32m✓ ${passed}/${passed} session assertions passed\x1b[0m\n`);
