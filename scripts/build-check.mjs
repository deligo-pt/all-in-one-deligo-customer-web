#!/usr/bin/env node
/**
 * Runs a production build without disturbing a running dev server.
 *
 * The dev server owns `.next/`. Building in place while it runs corrupts that
 * directory, and the failure is confusing rather than loud — stale chunks, a
 * dev server serving a page that no longer exists.
 *
 * The first attempt at this copied the whole project to a temp directory and
 * symlinked `node_modules` back. Turbopack rejected it outright: "Symlink
 * [project]/node_modules is invalid, it points out of the filesystem root".
 * The copy was solving the wrong problem anyway. Nothing about a build needs a
 * separate *tree* — it needs a separate *output directory*, which is one config
 * value. `NEXT_DIST_DIR` is read in next.config.ts and set here.
 *
 * Consequence worth knowing: this build shares the working tree, so it sees
 * uncommitted edits. That is what we want from a gate — it checks what is on
 * disk now, not what was committed.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = process.env.NEXT_DIST_DIR ?? ".next-build";

console.log(`\n▸ build check — output to ${distDir}/ (dev server keeps .next/)\n`);

execFileSync(join(root, "node_modules", "next", "dist", "bin", "next"), ["build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_DIST_DIR: distDir, NEXT_TELEMETRY_DISABLED: "1" },
});

if (!existsSync(join(root, distDir))) {
  console.error(`\n✗ build produced no ${distDir} directory`);
  process.exit(1);
}
console.log(`\n✓ build check passed — .next/ untouched\n`);
