import fs from "node:fs";
import path from "node:path";
import { ITEMS } from "../../src/lib/data/items";
import { buildQueryPlan } from "./queries";
import { launchScraperContext, scrapeQuery, randomDelayMs, sleep } from "./scraper";
import { parseListings } from "./parse";
import { findConfidentMatch, type MatchResult } from "./match";

interface StoredEntry extends MatchResult {
  itemId: string;
  queryUsed: string;
  scrapedAt: string;
}

const OUT_DIR = path.join(__dirname, "..", "..", "data");
const OUT_FILE = path.join(OUT_DIR, "walmart-live.json");
const LOG_FILE = path.join(OUT_DIR, "walmart-run-log.json");

const INGEST_URL = process.env.WALMART_INGEST_URL ?? "http://localhost:2000/api/walmart-ingest";
const INGEST_TOKEN = process.env.WALMART_INGEST_TOKEN ?? "";

// Optional pilot/testing mode: WALMART_ITEM_IDS=bananas,chicken-breast,...
// runs only those items instead of all 336. Unset for the real daily run.
const ITEM_ID_FILTER = process.env.WALMART_ITEM_IDS
  ? new Set(process.env.WALMART_ITEM_IDS.split(",").map((s) => s.trim()))
  : null;
const RUN_ITEMS = ITEM_ID_FILTER
  ? ITEMS.filter((item) => ITEM_ID_FILTER.has(item.id))
  : ITEMS;

// Confirms the ingest endpoint is actually reachable (right server, right
// token) before committing to a run that can take hours. Uses GET, which
// only reads the existing file — unlike POST, it can never overwrite it,
// so this check is safe to make even if it fails.
async function verifyIngestReachable(): Promise<void> {
  if (!INGEST_TOKEN) {
    console.log("WALMART_INGEST_TOKEN not set — results will only be saved locally, never pushed.");
    return;
  }
  try {
    const res = await fetch(INGEST_URL, {
      method: "GET",
      headers: { "X-Scraper-Token": INGEST_TOKEN },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}${res.status === 401 ? " (token mismatch)" : ""}`);
    }
    console.log(`Ingest endpoint reachable at ${INGEST_URL}.`);
  } catch (err) {
    console.error(
      `\nCannot reach ingest endpoint at ${INGEST_URL}: ${(err as Error).message}\n` +
        `Make sure the app is running there before starting a scrape (e.g. "npm run dev" locally, ` +
        `or that WALMART_INGEST_URL points at a live deployment) and that WALMART_INGEST_TOKEN ` +
        `matches on both sides.\nAborting before starting the multi-hour scrape.\n`
    );
    process.exit(1);
  }
}

async function pushResults(results: Record<string, StoredEntry>, attempt = 1): Promise<boolean> {
  try {
    const res = await fetch(INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Scraper-Token": INGEST_TOKEN,
      },
      body: JSON.stringify(results),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    if (attempt >= 3) {
      console.error(`Progress push failed after ${attempt} attempts:`, (err as Error).message);
      return false;
    }
    await sleep(1000 * attempt);
    return pushResults(results, attempt + 1);
  }
}

// Saved after every item (not just at the end) so a multi-hour run that
// gets interrupted partway through — crash, network drop, computer
// sleeping — still leaves whatever was found so far in place, both
// locally and pushed to the running app, instead of losing everything.
async function saveProgress(results: Record<string, StoredEntry>) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));

  if (!INGEST_TOKEN) return;
  await pushResults(results);
}

async function main() {
  const startedAt = Date.now();
  if (ITEM_ID_FILTER) {
    console.log(`Pilot mode: running ${RUN_ITEMS.length} of ${ITEMS.length} items (${RUN_ITEMS.map((i) => i.id).join(", ")})`);
  } else {
    console.log(`Full run: ${RUN_ITEMS.length} items`);
  }
  await verifyIngestReachable();

  const context = await launchScraperContext();
  const page = await context.newPage();

  const results: Record<string, StoredEntry> = {};
  const unmatched: string[] = [];
  let totalQueries = 0;

  for (let i = 0; i < RUN_ITEMS.length; i++) {
    const item = RUN_ITEMS[i];
    const plan = buildQueryPlan(item);
    let matched: MatchResult | null = null;
    let queryUsed = "";

    for (const query of plan) {
      totalQueries++;
      let raw: string[];
      try {
        raw = await scrapeQuery(page, query);
      } catch (err) {
        console.error(`[${item.id}] query "${query}" failed:`, (err as Error).message);
        await sleep(randomDelayMs(3000, 6000));
        continue;
      }

      const listings = parseListings(raw);
      const found = findConfidentMatch(listings, item);
      if (found) {
        matched = found;
        queryUsed = query;
        break;
      }
      await sleep(randomDelayMs(3000, 6000));
    }

    if (matched) {
      results[item.id] = {
        ...matched,
        itemId: item.id,
        queryUsed,
        scrapedAt: new Date().toISOString(),
      };
      console.log(`[${i + 1}/${RUN_ITEMS.length}] [${item.id}] matched via "${queryUsed}": $${matched.price}${matched.isDeal ? ` (was $${matched.wasPrice})` : ""}`);
    } else {
      unmatched.push(item.id);
      console.log(`[${i + 1}/${RUN_ITEMS.length}] [${item.id}] no match today (tried ${plan.length} queries)`);
    }

    await saveProgress(results);
    await sleep(randomDelayMs(2000, 5000));
  }

  await context.close();

  const summary = {
    ranAt: new Date().toISOString(),
    durationMinutes: Math.round((Date.now() - startedAt) / 60000),
    totalItems: RUN_ITEMS.length,
    matchedCount: Object.keys(results).length,
    unmatchedCount: unmatched.length,
    unmatchedIds: unmatched,
    totalQueriesRun: totalQueries,
  };
  fs.writeFileSync(LOG_FILE, JSON.stringify(summary, null, 2));
  console.log("\n--- Run summary ---");
  console.log(JSON.stringify(summary, null, 2));

  if (!INGEST_TOKEN) {
    console.log("WALMART_INGEST_TOKEN not set — results were only saved locally, never pushed.");
  }
}

main().catch((err) => {
  console.error("run-daily failed:", err);
  process.exit(1);
});
