#!/usr/bin/env tsx
/**
 * Crawl the running dev server and screenshot every design page in
 * both light and dark mode — in parallel.
 *
 *   npm run dev:www                        # in another terminal
 *   npm run snapshot                       # this script
 *
 * Walks `/` to discover every design link, then fans out N concurrent
 * workers (each with its own browser context + page) that take screenshots
 * from a shared work queue. PNGs land at
 * `apps/www/public/previews/<category>__<design>--<mode>.png`.
 *
 * Env knobs:
 *   SNAPSHOT_BASE_URL       default http://localhost:4000
 *   SNAPSHOT_CONCURRENCY    default 4   (set to 1 to debug; 8 if your
 *                                       dev server can take it)
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const BASE = process.env.SNAPSHOT_BASE_URL ?? "http://localhost:4000";
const CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.SNAPSHOT_CONCURRENCY ?? "4", 10) || 4,
);
const OUT_DIR = resolve(process.cwd(), "apps/www/public/previews");
const VIEWPORT = { width: 1440, height: 900 };
const SETTLE_MS = 900;
const MODES = ["light", "dark"] as const;
type Mode = (typeof MODES)[number];

interface Task {
  mode: Mode;
  path: string;
  category: string;
  design: string;
}

async function reachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET" });
    return res.ok || (res.status >= 300 && res.status < 400);
  } catch {
    return false;
  }
}

function uniq(xs: string[]): string[] {
  return Array.from(new Set(xs));
}

async function discover(browser: import("playwright").Browser): Promise<string[]> {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  // Landing renders every design as a <Link to="/c/<cat>/<design>">,
  // so one pass collects them all.
  let designPaths = uniq(
    await page.$$eval('a[href^="/c/"]', (els) =>
      els
        .map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? "")
        .filter((h) => /^\/c\/[^/?#]+\/[^/?#]+\/?$/.test(h))
        .map((h) => h.replace(/\/$/, "")),
    ),
  );

  // Fallback if the landing layout changes — crawl per category.
  if (designPaths.length === 0) {
    const categoryPaths = uniq(
      await page.$$eval('a[href^="/c/"]', (els) =>
        els
          .map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? "")
          .filter((h) => /^\/c\/[^/?#]+\/?$/.test(h))
          .map((h) => h.replace(/\/$/, "")),
      ),
    );
    const found: string[] = [];
    for (const cat of categoryPaths) {
      await page.goto(`${BASE}${cat}`, { waitUntil: "networkidle" });
      const more = await page.$$eval('a[href^="/c/"]', (els) =>
        els
          .map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? "")
          .filter((h) => /^\/c\/[^/?#]+\/[^/?#]+\/?$/.test(h))
          .map((h) => h.replace(/\/$/, "")),
      );
      for (const p of uniq(more)) {
        if (!found.includes(p)) found.push(p);
      }
    }
    designPaths = found;
  }

  await ctx.close();
  return designPaths;
}

async function runWorker(
  workerIdx: number,
  browser: import("playwright").Browser,
  queue: Task[],
  total: number,
  state: { done: number; failed: number },
): Promise<void> {
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  let lastMode: Mode | null = null;

  // Shift is synchronous in JS — safe across awaiting workers.
  while (queue.length > 0) {
    const task = queue.shift();
    if (!task) break;

    try {
      if (task.mode !== lastMode) {
        await page.emulateMedia({ colorScheme: task.mode });
        lastMode = task.mode;
      }
      const file = resolve(
        OUT_DIR,
        `${task.category}__${task.design}--${task.mode}.png`,
      );
      await page.goto(`${BASE}${task.path}?preview=1`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(SETTLE_MS);
      await page.screenshot({ path: file, fullPage: false });
      state.done += 1;
      const idx = state.done.toString().padStart(3, " ");
      process.stdout.write(
        `[snapshot] [${idx}/${total}] w${workerIdx} · ${task.mode} · ${task.category}/${task.design}\n`,
      );
    } catch (err) {
      state.failed += 1;
      const reason =
        err instanceof Error ? err.message.split("\n")[0] : String(err);
      process.stdout.write(
        `[snapshot] [   /${total}] w${workerIdx} · ${task.mode} · ${task.category}/${task.design} ✗ ${reason}\n`,
      );
    }
  }

  await ctx.close();
}

async function main(): Promise<void> {
  if (!(await reachable(BASE))) {
    console.error(
      `[snapshot] no server at ${BASE}. Start it (e.g. \`npm run dev:www\`) and re-run.`,
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const t0 = Date.now();

  console.log(`[snapshot] discovering from ${BASE}/`);
  const designPaths = await discover(browser);

  if (designPaths.length === 0) {
    console.warn("[snapshot] no design pages discovered — nothing to do.");
    await browser.close();
    return;
  }
  console.log(
    `[snapshot] discovered ${designPaths.length} designs · concurrency=${CONCURRENCY}`,
  );

  // Build the work queue (modes grouped together so each worker switches
  // emulateMedia at most twice — once for its first task, once when it
  // crosses the mode boundary).
  const queue: Task[] = [];
  for (const mode of MODES) {
    for (const path of designPaths) {
      const match = /^\/c\/([^/]+)\/([^/]+)$/.exec(path);
      if (!match) continue;
      const [, category, design] = match;
      queue.push({ mode, path, category: category!, design: design! });
    }
  }
  const total = queue.length;
  const state = { done: 0, failed: 0 };

  await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) =>
      runWorker(i + 1, browser, queue, total, state),
    ),
  );

  await browser.close();
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const avg = total > 0 ? ((Date.now() - t0) / total / 1000).toFixed(2) : "0";
  console.log(
    `[snapshot] wrote ${state.done} previews in ${elapsed}s ` +
      `(avg ${avg}s/snap, ${CONCURRENCY}× parallel)` +
      (state.failed > 0 ? ` · ${state.failed} failed` : "") +
      ` → ${OUT_DIR}`,
  );
  process.exit(state.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[snapshot] failed:", err);
  process.exit(1);
});
