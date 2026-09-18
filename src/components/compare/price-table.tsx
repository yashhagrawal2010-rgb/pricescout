"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QtyStepper } from "@/components/list/qty-stepper";
import { ITEMS, ITEM_MAP } from "@/lib/data/items";
import { STORE_MAP } from "@/lib/data/stores";
import { getEffectivePrice } from "@/lib/effective-price";
import { getPriceTierCells } from "@/lib/price-tiers";
import { formatCurrency } from "@/lib/format";
import { useAppStore } from "@/lib/store/use-app-store";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES: (Category | "all")[] = [
  "all",
  "produce",
  "dairy",
  "meat",
  "bakery",
  "frozen",
  "household",
  "pantry",
];

const TIER_STYLES = {
  best: "bg-price-best text-price-best-foreground",
  mid: "bg-price-mid text-price-mid-foreground",
  worst: "bg-price-worst text-price-worst-foreground",
};

export function PriceTable({ scope }: { scope: "list" | "all" }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const selectedStores = useAppStore((s) => s.selectedStores);
  const list = useAppStore((s) => s.list);
  const addItem = useAppStore((s) => s.addItem);
  const setQty = useAppStore((s) => s.setQty);
  const priceVersion = useAppStore((s) => s.priceVersion);

  const qtyByItemId = useMemo(
    () => new Map(list.map((entry) => [entry.itemId, entry.qty])),
    [list]
  );

  const baseItems = useMemo(() => {
    if (scope === "list") {
      return list.map((entry) => ITEM_MAP[entry.itemId]).filter(Boolean);
    }
    return ITEMS;
  }, [scope, list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseItems.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery = !q || item.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [baseItems, query, category]);

  const totals = useMemo(() => {
    if (scope !== "list") return null;
    const sums = new Map(selectedStores.map((s) => [s, 0]));
    for (const entry of list) {
      const item = ITEM_MAP[entry.itemId];
      if (!item) continue;
      for (const storeId of selectedStores) {
        const { price } = getEffectivePrice(item.id, storeId);
        sums.set(storeId, (sums.get(storeId) ?? 0) + price * entry.qty);
      }
    }
    return sums;
  }, [scope, list, selectedStores, priceVersion]);

  if (selectedStores.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="font-medium text-foreground">No stores selected</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Select at least one store to compare prices.
        </p>
      </div>
    );
  }

  if (scope === "list" && list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="font-medium text-foreground">Your list is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Switch to &ldquo;All items&rdquo; to browse and add items to compare.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="h-11 rounded-xl pl-9"
          />
        </div>
      </div>
      <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {cat === "all" ? "All items" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-14 text-center">
          <p className="font-medium text-foreground">No items match &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="sticky left-0 z-10 bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">
                  Item
                </th>
                {selectedStores.map((storeId) => (
                  <th
                    key={storeId}
                    className="whitespace-nowrap px-3 py-3 text-center font-semibold text-foreground"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: STORE_MAP[storeId].accent }}
                      />
                      {STORE_MAP[storeId].shortName}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold text-foreground">
                  {scope === "list" ? "Qty" : "Add"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, rowIndex) => {
                const cells = getPriceTierCells(item, selectedStores);
                const qty = qtyByItemId.get(item.id) ?? 0;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(rowIndex, 12) * 0.02 }}
                    className="border-b border-border/60 last:border-0 hover:bg-accent/30"
                  >
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                      </div>
                    </td>
                    {cells.map((cell) => (
                      <td key={cell.storeId} className="px-3 py-2.5 text-center">
                        <span
                          className={cn(
                            "inline-block min-w-16 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                            TIER_STYLES[cell.tier]
                          )}
                        >
                          {formatCurrency(cell.price)}
                          {cell.isDeal && (
                            <span className="ml-1 text-[10px] font-bold">▼</span>
                          )}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center">
                      {scope === "list" ? (
                        <QtyStepper
                          qty={qty}
                          size="sm"
                          onChange={(next) => setQty(item.id, next)}
                        />
                      ) : qty > 0 ? (
                        <QtyStepper
                          qty={qty}
                          size="sm"
                          onChange={(next) => setQty(item.id, next)}
                        />
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            addItem(item.id);
                            toast.success(`Added ${item.name}`);
                          }}
                        >
                          Add
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
            {scope === "list" && totals && (
              <tfoot>
                <tr className="border-t-2 border-border bg-secondary/40 font-semibold">
                  <td className="sticky left-0 z-10 bg-secondary/40 px-4 py-3 text-foreground">
                    Total
                  </td>
                  {(() => {
                    const values = selectedStores.map((s) => totals.get(s) ?? 0);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    return selectedStores.map((storeId) => {
                      const total = totals.get(storeId) ?? 0;
                      const tier = total === min ? "best" : total === max && max !== min ? "worst" : "mid";
                      return (
                        <td key={storeId} className="px-3 py-3 text-center">
                          <span
                            className={cn(
                              "inline-block min-w-16 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
                              TIER_STYLES[tier]
                            )}
                          >
                            {formatCurrency(total)}
                          </span>
                        </td>
                      );
                    });
                  })()}
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {scope === "all" && (
        <p className="text-xs text-muted-foreground">
          Green is the cheapest store for that item, red is the priciest.
          Hit &ldquo;Add&rdquo; to drop anything straight onto your list.
        </p>
      )}
    </div>
  );
}
