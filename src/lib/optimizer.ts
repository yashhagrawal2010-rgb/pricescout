import { ITEM_MAP } from "@/lib/data/items";
import { getEffectivePrice } from "@/lib/effective-price";
import type { ListEntry, StoreId } from "@/lib/types";

export interface OptimizerSettings {
  /** Max number of distinct stores the shopper is willing to visit. */
  maxStores: number;
  /** Assumed dollar cost (gas/time) of visiting one additional store. */
  tripCost: number;
}

export const DEFAULT_OPTIMIZER_SETTINGS: OptimizerSettings = {
  maxStores: 2,
  tripCost: 5,
};

export interface StoreTotal {
  storeId: StoreId;
  total: number;
}

export interface ItemBreakdown {
  itemId: string;
  qty: number;
  bestStoreId: StoreId;
  bestUnitPrice: number;
  bestLineTotal: number;
  pricesByStore: Record<StoreId, number>;
}

export interface OptimizerResult {
  /** Total cost of buying the entire list at each selected store. */
  singleStoreTotals: StoreTotal[];
  /** Cheapest single-store option. */
  cheapestSingleStore: StoreTotal | null;
  /** Most expensive single-store option (worst case, for savings framing). */
  mostExpensiveSingleStore: StoreTotal | null;
  /** The recommended plan: which store to buy each item from. */
  optimalStoreIds: StoreId[];
  optimalTotal: number;
  itemBreakdown: ItemBreakdown[];
  /** True when splitting across >1 store beats the best single-store trip. */
  isSplitWorthIt: boolean;
  /** Amount saved vs. the cheapest single-store trip. */
  savingsVsCheapestSingle: number;
  /** Amount saved vs. the most expensive single-store trip (headline number). */
  savingsVsMostExpensive: number;
  percentSavedVsMostExpensive: number;
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [first, ...rest] = items;
  const withFirst = combinations(rest, size - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

export function computeOptimizerResult(
  list: ListEntry[],
  selectedStores: StoreId[],
  settings: OptimizerSettings = DEFAULT_OPTIMIZER_SETTINGS
): OptimizerResult | null {
  if (list.length === 0 || selectedStores.length === 0) return null;

  const entries = list.filter((entry) => ITEM_MAP[entry.itemId]);
  if (entries.length === 0) return null;

  // Price of every item at every selected store (deal-aware).
  const priceMatrix = entries.map((entry) => {
    const pricesByStore = {} as Record<StoreId, number>;
    for (const storeId of selectedStores) {
      pricesByStore[storeId] = getEffectivePrice(entry.itemId, storeId).price;
    }
    return { entry, pricesByStore };
  });

  const singleStoreTotals: StoreTotal[] = selectedStores.map((storeId) => ({
    storeId,
    total: priceMatrix.reduce(
      (sum, row) => sum + row.pricesByStore[storeId] * row.entry.qty,
      0
    ),
  }));

  const sortedSingle = [...singleStoreTotals].sort((a, b) => a.total - b.total);
  const cheapestSingleStore = sortedSingle[0] ?? null;
  const mostExpensiveSingleStore = sortedSingle[sortedSingle.length - 1] ?? null;

  const maxStores = Math.min(
    Math.max(1, settings.maxStores),
    selectedStores.length
  );

  let bestSubset: StoreId[] = cheapestSingleStore ? [cheapestSingleStore.storeId] : [];
  let bestEffectiveCost = cheapestSingleStore?.total ?? Infinity;

  for (let size = 1; size <= maxStores; size++) {
    for (const subset of combinations(selectedStores, size)) {
      const rawCost = priceMatrix.reduce((sum, row) => {
        const cheapestInSubset = Math.min(
          ...subset.map((storeId) => row.pricesByStore[storeId])
        );
        return sum + cheapestInSubset * row.entry.qty;
      }, 0);
      const tripPenalty = (size - 1) * settings.tripCost;
      const effectiveCost = rawCost + tripPenalty;
      if (effectiveCost < bestEffectiveCost) {
        bestEffectiveCost = effectiveCost;
        bestSubset = subset;
      }
    }
  }

  const itemBreakdown: ItemBreakdown[] = priceMatrix.map(({ entry, pricesByStore }) => {
    let bestStoreId = bestSubset[0];
    let bestUnitPrice = pricesByStore[bestStoreId];
    for (const storeId of bestSubset) {
      if (pricesByStore[storeId] < bestUnitPrice) {
        bestUnitPrice = pricesByStore[storeId];
        bestStoreId = storeId;
      }
    }
    return {
      itemId: entry.itemId,
      qty: entry.qty,
      bestStoreId,
      bestUnitPrice,
      bestLineTotal: bestUnitPrice * entry.qty,
      pricesByStore,
    };
  });

  const optimalTotal = itemBreakdown.reduce((sum, row) => sum + row.bestLineTotal, 0);

  const savingsVsCheapestSingle = Math.max(
    0,
    (cheapestSingleStore?.total ?? optimalTotal) - optimalTotal
  );
  const savingsVsMostExpensive = Math.max(
    0,
    (mostExpensiveSingleStore?.total ?? optimalTotal) - optimalTotal
  );
  const percentSavedVsMostExpensive = mostExpensiveSingleStore?.total
    ? (savingsVsMostExpensive / mostExpensiveSingleStore.total) * 100
    : 0;

  return {
    singleStoreTotals,
    cheapestSingleStore,
    mostExpensiveSingleStore,
    optimalStoreIds: bestSubset,
    optimalTotal,
    itemBreakdown,
    isSplitWorthIt: bestSubset.length > 1,
    savingsVsCheapestSingle,
    savingsVsMostExpensive,
    percentSavedVsMostExpensive,
  };
}
