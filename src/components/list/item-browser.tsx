"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QtyStepper } from "@/components/list/qty-stepper";
import { ITEMS } from "@/lib/data/items";
import { STORE_MAP } from "@/lib/data/stores";
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

export function ItemBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const selectedStores = useAppStore((s) => s.selectedStores);
  const list = useAppStore((s) => s.list);
  const addItem = useAppStore((s) => s.addItem);
  const setQty = useAppStore((s) => s.setQty);
  // Subscribed only so this component re-renders once live Walmart prices
  // land (getPriceTierCells reads the shared in-memory cache directly).
  useAppStore((s) => s.priceVersion);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery = !q || item.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const qtyByItemId = useMemo(
    () => new Map(list.map((entry) => [entry.itemId, entry.qty])),
    [list]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${ITEMS.length}+ items — milk, eggs, chicken breast…`}
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

      {selectedStores.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
          <StoreIcon className="size-8 text-muted-foreground/50" />
          <p className="font-medium text-foreground">Select a store above first</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Choose at least one store so we can show you real prices for each
            item.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
          <Search className="size-8 text-muted-foreground/50" />
          <p className="font-medium text-foreground">No items match &ldquo;{query}&rdquo;</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Try a different search term or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {filtered.map((item) => {
              const cells = getPriceTierCells(item, selectedStores);
              const qty = qtyByItemId.get(item.id) ?? 0;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors",
                    qty > 0 ? "border-primary/50 bg-primary/5" : "border-border"
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.unit}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {cells.map((cell) => (
                        <span
                          key={cell.storeId}
                          title={STORE_MAP[cell.storeId].name}
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                            TIER_STYLES[cell.tier]
                          )}
                        >
                          {formatCurrency(cell.price)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {qty > 0 ? (
                      <QtyStepper qty={qty} onChange={(next) => setQty(item.id, next)} size="sm" />
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          addItem(item.id);
                          toast.success(`Added ${item.name}`, {
                            description: "Check your savings summary for an update.",
                          });
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
