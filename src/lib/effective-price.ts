import { ITEM_MAP } from "@/lib/data/items";
import { WEEKLY_DEALS } from "@/lib/data/deals";
import { getWalmartOverride } from "@/lib/data/walmart-client-cache";
import type { StoreId } from "@/lib/types";

const DEAL_INDEX = new Map(
  WEEKLY_DEALS.map((deal) => [`${deal.itemId}:${deal.storeId}`, deal])
);

export interface EffectivePrice {
  price: number;
  originalPrice: number;
  isDeal: boolean;
  percentOff?: number;
}

export function getEffectivePrice(
  itemId: string,
  storeId: StoreId
): EffectivePrice {
  const item = ITEM_MAP[itemId];

  // Live scraped Walmart price wins over the mock price when available
  // (the client fetches /api/walmart-prices and populates this in-memory
  // cache on load — see WalmartPriceSync); otherwise fall through to the
  // deterministic mock data below, same as every other store.
  if (storeId === "walmart") {
    const live = getWalmartOverride(itemId);
    if (live) {
      return {
        price: live.price,
        originalPrice: live.wasPrice ?? live.price,
        isDeal: live.isDeal,
        percentOff: live.percentOff ?? undefined,
      };
    }
  }

  const originalPrice = item.prices[storeId];
  const deal = DEAL_INDEX.get(`${itemId}:${storeId}`);
  if (!deal) {
    return { price: originalPrice, originalPrice, isDeal: false };
  }
  const price = Math.round(originalPrice * (1 - deal.percentOff / 100) * 100) / 100;
  return { price, originalPrice, isDeal: true, percentOff: deal.percentOff };
}
