import { ITEM_MAP } from "@/lib/data/items";
import { STORE_MAP } from "@/lib/data/stores";
import { formatCurrency } from "@/lib/format";
import type { OptimizerResult } from "@/lib/optimizer";

export function buildShareText(result: OptimizerResult): string {
  const lines: string[] = [];

  lines.push("🛒 My PriceScout shopping list");
  lines.push("");

  if (result.isSplitWorthIt) {
    const storeNames = result.optimalStoreIds
      .map((id) => STORE_MAP[id].name)
      .join(" + ");
    lines.push(`Recommended: split the trip across ${storeNames}`);
  } else {
    const storeName = STORE_MAP[result.optimalStoreIds[0]].name;
    lines.push(`Recommended store: ${storeName}`);
  }
  lines.push("");

  for (const row of result.itemBreakdown) {
    const item = ITEM_MAP[row.itemId];
    if (!item) continue;
    const qtyLabel = row.qty > 1 ? ` x${row.qty}` : "";
    lines.push(
      `• ${item.name}${qtyLabel} — ${formatCurrency(row.bestUnitPrice)} @ ${STORE_MAP[row.bestStoreId].shortName}`
    );
  }
  lines.push("");

  lines.push(`Total: ${formatCurrency(result.optimalTotal)}`);
  if (result.mostExpensiveSingleStore && result.savingsVsMostExpensive > 0.004) {
    lines.push(
      `Saved ${formatCurrency(result.savingsVsMostExpensive)} (${Math.round(result.percentSavedVsMostExpensive)}%) vs. buying it all at ${STORE_MAP[result.mostExpensiveSingleStore.storeId].shortName}`
    );
  }
  lines.push("");
  lines.push("Built with PriceScout — free grocery price comparison for Rockland County, NY.");

  return lines.join("\n");
}
