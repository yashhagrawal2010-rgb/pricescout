"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QtyStepper } from "@/components/list/qty-stepper";
import { ITEM_MAP } from "@/lib/data/items";
import { STORE_MAP } from "@/lib/data/stores";
import { getPriceTierCells } from "@/lib/price-tiers";
import { formatCurrency } from "@/lib/format";
import { useAppStore } from "@/lib/store/use-app-store";

export function ShoppingList() {
  const list = useAppStore((s) => s.list);
  const selectedStores = useAppStore((s) => s.selectedStores);
  const setQty = useAppStore((s) => s.setQty);
  const removeItem = useAppStore((s) => s.removeItem);
  const clearList = useAppStore((s) => s.clearList);

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingBag className="size-6" />
        </span>
        <p className="font-heading font-bold text-foreground">Your list is empty</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Search or browse items below to start building your list — we&apos;ll
          price it out at every store you&apos;ve selected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Your list
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {list.length} item{list.length === 1 ? "" : "s"}
          </span>
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={clearList}
        >
          <Trash2 className="size-3.5" />
          Clear
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {list.map((entry) => {
          const item = ITEM_MAP[entry.itemId];
          if (!item) return null;
          const cells =
            selectedStores.length > 0 ? getPriceTierCells(item, selectedStores) : [];
          const best = cells.find((c) => c.tier === "best");

          return (
            <motion.div
              key={entry.itemId}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                  {best && (
                    <p className="mt-0.5 text-xs font-medium text-price-best-foreground">
                      Best: {formatCurrency(best.price)} at{" "}
                      {STORE_MAP[best.storeId].shortName}
                    </p>
                  )}
                </div>
                <QtyStepper qty={entry.qty} onChange={(qty) => setQty(entry.itemId, qty)} />
                <button
                  type="button"
                  onClick={() => removeItem(entry.itemId)}
                  aria-label={`Remove ${item.name}`}
                  className="ml-1 flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
