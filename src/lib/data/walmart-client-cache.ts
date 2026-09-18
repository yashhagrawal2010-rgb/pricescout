// Client-safe, in-memory cache for live-scraped Walmart prices. No Node
// APIs here on purpose — this module gets bundled into the browser, so it
// can only hold whatever the client fetched over HTTP from
// /api/walmart-prices, never read a file directly.

export interface WalmartOverride {
  price: number;
  wasPrice: number | null;
  isDeal: boolean;
  percentOff: number | null;
  scrapedAt: string;
}

let overrides: Record<string, WalmartOverride> = {};

export function getWalmartOverride(itemId: string): WalmartOverride | null {
  return overrides[itemId] ?? null;
}

export function getAllWalmartOverrides(): Record<string, WalmartOverride> {
  return overrides;
}

export function setWalmartOverrides(data: Record<string, WalmartOverride>): void {
  overrides = data;
}
