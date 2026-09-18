"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QtyStepper } from "@/components/list/qty-stepper";
import { STORE_MAP } from "@/lib/data/stores";
import { formatCurrency } from "@/lib/format";
import { useAppStore } from "@/lib/store/use-app-store";
import type { GroceryItem, StoreId } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DealCardData {
  item: GroceryItem;
  storeId: StoreId;
  percentOff: number;
  originalPrice: number;
  salePrice: number;
  savings: number;
}

export function DealCard({ deal, index }: { deal: DealCardData; index: number }) {
  const store = STORE_MAP[deal.storeId];
  const qty = useAppStore(
    (s) => s.list.find((entry) => entry.itemId === deal.item.id)?.qty ?? 0
  );
  const addItem = useAppStore((s) => s.addItem);
  const setQty = useAppStore((s) => s.setQty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      className="relative overflow-visible rounded-2xl border border-border bg-card shadow-sm"
    >
      <span
        className={cn(
          "absolute -top-3 -right-3 z-10 rotate-6 rounded-full bg-destructive px-3 py-1.5",
          "text-sm font-extrabold text-white shadow-md"
        )}
      >
        -{deal.percentOff}%
      </span>

      <div className="p-4 pb-0">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: store.accent }}
          />
          {store.shortName}
          <span className="ml-auto rounded-full bg-price-best px-2 py-0.5 text-[10px] font-bold text-price-best-foreground">
            This week
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
            {deal.item.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading font-bold text-foreground">
              {deal.item.name}
            </p>
            <p className="text-xs text-muted-foreground">{deal.item.unit}</p>
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-extrabold text-primary">
            {formatCurrency(deal.salePrice)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(deal.originalPrice)}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-semibold text-price-best-foreground">
          You save {formatCurrency(deal.savings)}
        </p>
      </div>

      {/* ticket perforation */}
      <div className="relative my-4">
        <div className="border-t border-dashed border-border" />
        <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-background" />
      </div>

      <div className="p-4 pt-0">
        {qty > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              In your list
            </span>
            <QtyStepper qty={qty} size="sm" onChange={(next) => setQty(deal.item.id, next)} />
          </div>
        ) : (
          <Button
            type="button"
            className="w-full rounded-xl"
            onClick={() => {
              addItem(deal.item.id);
              toast.success(`Added ${deal.item.name}`, {
                description: `Locked in the ${store.shortName} deal price.`,
              });
            }}
          >
            Add to my list
          </Button>
        )}
      </div>
    </motion.div>
  );
}
