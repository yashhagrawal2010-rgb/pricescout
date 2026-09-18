import { STORE_ORDER } from "@/lib/types";
import type { StoreId } from "@/lib/types";
import { STORE_PRICE_BIAS } from "@/lib/data/stores";

// Deterministic string hash (FNV-1a) so mock prices are stable across
// server and client renders without hand-authoring every cell.
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/**
 * Generates a realistic per-store price for an item from a base (national
 * average) price. Combines each chain's general price positioning with a
 * per-item jitter so results don't feel like a flat percentage everywhere.
 */
export function generatePrices(
  itemId: string,
  basePrice: number
): Record<StoreId, number> {
  const prices = {} as Record<StoreId, number>;
  for (const storeId of STORE_ORDER) {
    const bias = STORE_PRICE_BIAS[storeId];
    const jitter = 0.9 + hash(`${itemId}:${storeId}`) * 0.22;
    const raw = basePrice * bias * jitter;
    // Snap to a believable price ending (.x9)
    const cents = Math.round(raw * 20) / 20;
    prices[storeId] = Math.max(0.49, Math.round(cents * 100 - 1) / 100 + 0.0);
  }
  return prices;
}
