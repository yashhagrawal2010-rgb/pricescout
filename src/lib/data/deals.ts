import { ITEMS, ITEM_MAP } from "@/lib/data/items";
import { getAllWalmartOverrides } from "@/lib/data/walmart-client-cache";
import type { Deal, StoreId } from "@/lib/types";

// Hand-picked "deal of the week" combinations — mock data highlighting a
// standout discount for a specific item at a specific store. Used as the
// deals page's fallback when there's no fresh live Walmart data (see
// getDisplayDeals below), and also consulted by effective-price.ts as a
// general discount overlay for every store's prices app-wide — leave this
// array itself alone, it's more than just the deals page's data source.
export const WEEKLY_DEALS: Deal[] = [
  { itemId: "chicken-breast", storeId: "shoprite", percentOff: 30 },
  { itemId: "strawberries", storeId: "aldi", percentOff: 25 },
  { itemId: "ice-cream", storeId: "stopandshop", percentOff: 40 },
  { itemId: "large-eggs", storeId: "walmart", percentOff: 15 },
  { itemId: "salmon-fillet", storeId: "costco", percentOff: 20 },
  { itemId: "frozen-pizza", storeId: "traderjoes", percentOff: 25 },
  { itemId: "paper-towels", storeId: "keyfood", percentOff: 20 },
  { itemId: "ground-beef", storeId: "shoprite", percentOff: 22 },
  { itemId: "olive-oil", storeId: "aldi", percentOff: 18 },
];

// A live Walmart price only counts as a "deal" once it beats the ShopRite
// baseline by at least this much — small jitter between the mock catalog's
// per-store bias and a real scraped price shouldn't read as a markdown.
const MEANINGFUL_DISCOUNT_PERCENT = 10;

export interface DisplayDeals {
  deals: Deal[];
  source: "live" | "static";
}

// The non-Walmart stores that get their own generated deals, in the order
// candidates get filled. ShopRite is excluded — it IS the baseline every
// deal is measured against, so it can never be "X% off itself".
const OTHER_STORES: StoreId[] = ["stopandshop", "costco", "aldi", "traderjoes", "keyfood"];

// Every item where storeId's synthetic mock price meaningfully undercuts
// the ShopRite baseline, sorted best-discount-first. Stores whose overall
// price bias sits above ShopRite (Stop & Shop, Key Food — see
// STORE_PRICE_BIAS in stores.ts) will legitimately turn up few or none:
// their mock prices are rarely lower than ShopRite's at all, so there's
// nothing honest to generate there.
function getStoreCandidates(storeId: StoreId): Deal[] {
  const candidates: Deal[] = [];
  for (const item of ITEMS) {
    const baseline = item.prices.shoprite;
    if (baseline <= 0) continue;
    const percentOff = Math.round(((baseline - item.prices[storeId]) / baseline) * 100);
    if (percentOff >= MEANINGFUL_DISCOUNT_PERCENT) {
      candidates.push({ itemId: item.id, storeId, percentOff });
    }
  }
  return candidates.sort((a, b) => b.percentOff - a.percentOff);
}

// Splits `target` deals as evenly as possible across stores, giving any
// store that runs out of genuine candidates' unused share to the stores
// that still have some — so the total still reaches `target` (matching
// Walmart's live deal count) without ever inventing a deal that isn't
// actually a meaningful discount.
function fairAllocate(storeCandidates: Map<StoreId, Deal[]>, target: number): Deal[] {
  const taken = new Map<StoreId, number>(OTHER_STORES.map((s) => [s, 0]));
  let remaining = target;
  let active = OTHER_STORES.filter((s) => (storeCandidates.get(s)?.length ?? 0) > 0);

  while (remaining > 0 && active.length > 0) {
    const share = Math.max(1, Math.floor(remaining / active.length));
    for (const storeId of active) {
      if (remaining <= 0) break;
      const available = (storeCandidates.get(storeId)?.length ?? 0) - (taken.get(storeId) ?? 0);
      const take = Math.min(share, available, remaining);
      taken.set(storeId, (taken.get(storeId) ?? 0) + take);
      remaining -= take;
    }
    active = active.filter(
      (s) => (storeCandidates.get(s)?.length ?? 0) - (taken.get(s) ?? 0) > 0
    );
  }

  const result: Deal[] = [];
  for (const storeId of OTHER_STORES) {
    const count = taken.get(storeId) ?? 0;
    result.push(...(storeCandidates.get(storeId) ?? []).slice(0, count));
  }
  return result;
}

// Deals page's actual data source: builds "deal" entries from whatever
// fresh live Walmart prices are currently loaded (see WalmartPriceSync),
// keeping only items where Walmart meaningfully undercuts the synthetic
// ShopRite baseline price — then rounds out the same total count again
// from the other stores' own (synthetic) prices, so every store gets a
// fair shot at the deals page, not just Walmart. Falls back to the
// static WEEKLY_DEALS list above when there's no live data loaded at all.
export function getDisplayDeals(): DisplayDeals {
  const overrides = getAllWalmartOverrides();

  if (Object.keys(overrides).length === 0) {
    return { deals: WEEKLY_DEALS, source: "static" };
  }

  const walmartDeals: Deal[] = [];
  for (const [itemId, override] of Object.entries(overrides)) {
    const item = ITEM_MAP[itemId];
    if (!item) continue;
    const baseline = item.prices.shoprite;
    if (baseline <= 0) continue;

    const percentOff = Math.round(((baseline - override.price) / baseline) * 100);
    if (percentOff >= MEANINGFUL_DISCOUNT_PERCENT) {
      walmartDeals.push({ itemId, storeId: "walmart", percentOff });
    }
  }
  walmartDeals.sort((a, b) => b.percentOff - a.percentOff);

  const storeCandidates = new Map(OTHER_STORES.map((s) => [s, getStoreCandidates(s)]));
  const otherDeals = fairAllocate(storeCandidates, walmartDeals.length);

  const deals = [...walmartDeals, ...otherDeals].sort((a, b) => b.percentOff - a.percentOff);
  return { deals, source: "live" };
}
