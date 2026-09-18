import { ITEMS } from "@/lib/data/items";
import { STORE_ORDER } from "@/lib/types";

/** Average spread between the cheapest and priciest store, across every item. */
export function getAverageItemSavingsPercent(): number {
  const percents = ITEMS.map((item) => {
    const prices = STORE_ORDER.map((storeId) => item.prices[storeId]);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    return ((max - min) / max) * 100;
  });
  return percents.reduce((a, b) => a + b, 0) / percents.length;
}

export const ROCKLAND_TOWNS = [
  "Nyack",
  "New City",
  "Spring Valley",
  "Pearl River",
  "Suffern",
  "Nanuet",
  "Monsey",
  "Haverstraw",
];
