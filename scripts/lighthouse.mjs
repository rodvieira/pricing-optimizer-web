#!/usr/bin/env node
// Lighthouse audit runner for issue #5 (Lighthouse >= 95, HANDOFF.md Sprint 9
// target). Runs performance/accessibility/best-practices/seo against both
// routes and prints a summary table; exits non-zero if any category on any
// route falls below the threshold, so this can gate CI later if desired.
//
// Usage:
//   pnpm build && pnpm start &   # audit a real production build, not `next dev`
//   pnpm lighthouse                                    # audits localhost:3000
//   pnpm lighthouse https://pricing-optimizer-web.vercel.app  # audits a deployed URL
//
// Local dev-machine caveat (see PR that added this script): Lighthouse's
// default throttling *simulates* mobile CPU/network from a live trace: on a
// shared, resource-contended dev machine that simulation can be noisy,
// occasionally reporting a Largest Contentful Paint far higher than the
// audit's own lcp-breakdown-insight accounts for. Treat a local run as a
// smoke check; the number that matters is against a real deployed URL.

import { mkdirSync, writeFileSync } from "node:fs";
import { platform, tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const THRESHOLD = 95;
const ROUTES = ["/", "/studio"];
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const reportDir = fileURLToPath(new URL("../.lighthouse", import.meta.url));

async function auditRoute(chrome, route) {
  const url = `${baseUrl}${route}`;
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    onlyCategories: CATEGORIES,
    logLevel: "error",
  });
  return result.lhr;
}

async function main() {
  // Chrome itself (not just chrome-launcher) has been observed writing
  // stray profile/cache directories under this WSL2 setup using literal
  // Windows-style path strings ("C:\Users\...", "\\wsl.localhost\...") as
  // the directory *name*, created relative to CWD (backslashes aren't a
  // path separator on Linux, so the whole string becomes one segment).
  // Running from a scratch tmp dir means any of that lands somewhere
  // harmless instead of inside the repo, regardless of which Chrome
  // subsystem is responsible. reportDir below is resolved from this
  // script's own location, not CWD, so it's unaffected.
  const cwdBefore = process.cwd();
  const scratchDir = `${tmpdir()}/lighthouse-run-${Date.now()}`;
  mkdirSync(scratchDir, { recursive: true });
  process.chdir(scratchDir);

  // chrome-launcher writes its own log file into userDataDir before
  // launching, so it must exist upfront.
  const userDataDir = `${tmpdir()}/lighthouse-chrome-profile-${Date.now()}`;
  mkdirSync(userDataDir, { recursive: true });
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", ...(platform() === "linux" ? ["--no-sandbox"] : [])],
    userDataDir,
    chromePath: process.env.CHROME_PATH,
  });

  const rows = [];
  let failed = false;

  try {
    for (const route of ROUTES) {
      const lhr = await auditRoute(chrome, route);
      const scores = Object.fromEntries(
        CATEGORIES.map((c) => [c, Math.round((lhr.categories[c]?.score ?? 0) * 100)]),
      );
      rows.push({ route, ...scores });
      if (Object.values(scores).some((s) => s < THRESHOLD)) failed = true;

      writeFileSync(
        `${reportDir}/${route === "/" ? "landing" : route.replace(/^\//, "")}.report.json`,
        JSON.stringify(lhr, null, 2),
      );
    }
  } finally {
    chrome.kill();
    process.chdir(cwdBefore);
  }

  const header = ["route", ...CATEGORIES];
  const widths = header.map((h) =>
    Math.max(h.length, ...rows.map((r) => String(r[h] ?? r.route).length)),
  );
  const fmtRow = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join("  ");
  console.log(fmtRow(header));
  for (const r of rows) console.log(fmtRow([r.route, ...CATEGORIES.map((c) => r[c])]));
  console.log(`\nThreshold: ${THRESHOLD}. Full reports written to ${reportDir}/`);

  if (failed) {
    console.error(`\nOne or more categories fell below ${THRESHOLD}.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
