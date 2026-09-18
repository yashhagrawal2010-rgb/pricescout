import { getEffectivePrice } from "@/lib/effective-price";
import type { GroceryItem, StoreId } from "@/lib/types";

export type PriceTier = "best" | "mid" | "worst";

export interface PriceTierCell {
  storeId: StoreId;
  price: number;
  originalPrice: number;
  isDeal: boolean;
  percentOff?: number;
  tier: PriceTier;
}

export function getPriceTierCells(
  item: GroceryItem,
  storeIds: StoreId[]
): PriceTierCell[] {
  const effectivePrices = storeIds.map((storeId) => ({
    storeId,
    ...getEffectivePrice(item.id, storeId),
  }));

  const prices = effectivePrices.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return effectivePrices.map((p) => ({
    ...p,
    tier:
      prices.length <= 1
        ? "best"
        : p.price === min
          ? "best"
          : p.price === max && max !== min
            ? "worst"
            : "mid",
  }));
}
