import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ─────────────────────────────────────────────────────────────────────────────
// Architectural boundaries (Plan.md §3.2).
//
// These are lint errors, not conventions. A convention is a thing everyone
// agrees to and then breaks under deadline; a lint error is a thing the build
// refuses. The previous project had the same rules written in a document and
// ended up with a file-scoped denylist that a render prop walked straight
// through — the rule was right, nothing enforced it.
//
// Read each `message` below as the actual rule. The pattern is only how it is
// detected.
// ─────────────────────────────────────────────────────────────────────────────

// Cross-feature reach-through. `@/features/cart` (the index) is the public
// surface of a feature; `@/features/cart/api/getCart` is its inside. Importing
// the inside from another feature is what turns two features into one.
//
// Within a feature, use relative paths (`./api`, `../model`) — they are not
// matched here, which is exactly the distinction being drawn: an import that
// has to name another feature is crossing a boundary.
const NO_FEATURE_INTERNALS = {
  group: ["@/features/*/*"],
  message:
    "Import a feature through its index (`@/features/<name>`), never its internals. Inside the same feature, use a relative path.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // A primitive that knows what an order is, is not a primitive. `components/ui`
  // is the one place in the app with no domain knowledge at all — that is what
  // makes it reusable, and it stops being true the first time a Button imports
  // a cart store.
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/*/*", "@/services/*", "@/stores/*"],
              message:
                "components/ui must not know about features, services or stores. Pass data in as props.",
            },
          ],
        },
      ],
    },
  },

  // `lib/` is pure: no React, no network, no `window` at module scope. Pure
  // functions are the only code in the app that can be reasoned about without
  // running it, and that property is worth defending.
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "next",
                "next/*",
                "@/features/*",
                "@/features/*/*",
                "@/components/*",
                "@/stores/*",
                "@/hooks/*",
              ],
              message:
                "lib/ is pure utility code — no React, no Next, no app state. If it needs those, it belongs in hooks/ or a feature.",
            },
          ],
        },
      ],
    },
  },

  // Everywhere else in src: the feature boundary.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [NO_FEATURE_INTERNALS] }],
    },
  },

  // `scripts/` holds Node verification scripts, not application code. They are
  // not components and there is no React here to protect.
  {
    files: ["scripts/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
