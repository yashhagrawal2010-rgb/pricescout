# Walmart live price scraper

Daily pipeline that scrapes Walmart search results for each of the 336
catalog items, matches confident results to the catalog, detects deals,
and pushes them into the deployed app so the Walmart column reflects
live prices instead of the mock data.

## How it fits together

1. `run-daily.ts` loops every catalog item, tries `queries.ts`'s query
   plan (item name, then fallback phrasings) until `match.ts` finds a
   confident match or the plan is exhausted ("no match today" — this is
   expected and correct for items whose real Walmart listing doesn't
   surface well in search, e.g. plain fresh produce).
2. Results get saved locally to `data/walmart-live.json` and pushed via
   HTTP POST to `/api/walmart-ingest` on the running app (local dev or
   your deployed Replit URL).
3. `src/lib/data/walmart-live.ts` reads that file server-side; if an
   item has a fresh (< 36h old) scraped entry, `getEffectivePrice()`
   uses it for the Walmart column instead of the mock price. No entry,
   or a stale one, and it silently falls back to mock data — the app
   never breaks from a failed or partial scrape.

## One-time setup

Set these two environment variables wherever the scraper runs (locally)
**and** wherever the app is deployed (so the app can verify the token):

- `WALMART_INGEST_TOKEN` — any random string you generate once, shared
  between both places. Locally, put it in `.env.local` (already
  git-ignored). On Replit, add it in the Secrets tab.
- `WALMART_INGEST_URL` — only needed on the machine running the
  scraper, pointing at wherever the app is reachable, e.g.
  `https://your-app.replit.app/api/walmart-ingest`. Defaults to
  `http://localhost:2000/api/walmart-ingest` for local testing.

## Running it manually

Make sure the target app (local `npm run dev` or your deployment) is
already running and reachable at `WALMART_INGEST_URL` — the run aborts
immediately if it isn't, rather than scraping for hours with nothing
to push the results to.

```
npm run scrape:walmart
```

(equivalent to `npx tsx scripts/walmart/run-daily.ts`)

Prints per-item match results as it goes, then a summary (matched
count, unmatched count, total queries run, runtime) and writes the same
summary to `data/walmart-run-log.json`.

Before scraping, it does a GET check against `/api/walmart-ingest` (safe
— GET only reads, it never overwrites the stored file) to confirm the
endpoint is reachable and the token matches, and exits right away with
a clear error if not. Each per-item push to `/api/walmart-ingest`
retries up to 3 times with backoff before being logged as failed, so a
brief network hiccup doesn't drop that item's result — later items
still carry the full accumulated data, so one later successful push is
enough to catch everything up.

Note that `/api/walmart-ingest` POST fully replaces the stored file's
contents (it's not a merge), so nothing else should ever POST to it
with a partial or test payload.

## Known limitations (by design, not bugs)

- **Many items will show "no match today."** The strict matcher is
  intentional — it's better to keep the previous mock price than tag an
  item with a wrong product's price. Fresh commodity produce/meat is
  the category most likely to go unmatched, since Walmart's search
  often surfaces specialty/snack variants instead (confirmed from a
  real sample: searching "banana" returned dried banana snacks and
  unrelated pantry items, no fresh bananas).
- **This can get rate-limited or blocked.** The scraper uses a
  persistent browser profile and an anti-automation-detection flag to
  look like a real user, which is exactly the pattern Walmart's bot
  defenses try to catch. Running it against all 336 items (with
  fallback queries, worst case ~5 searches per item) is a lot of
  automated traffic in one run — expect this to need occasional
  re-authentication of the Edge profile, and to occasionally get fully
  blocked for a while.
- **Fragile to Walmart page changes.** The parser is built around the
  exact text pattern observed in one real sample (`current price $X` /
  `current price Now $X, Was $Y`). If Walmart changes their markup,
  parsing silently stops finding matches rather than erroring loudly —
  check `data/walmart-run-log.json`'s `matchedCount` after a run if
  numbers look off.
