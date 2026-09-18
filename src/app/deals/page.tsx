"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { DealCard, type DealCardData } from "@/components/deals/deal-card";
import { getDisplayDeals } from "@/lib/data/deals";
import { ITEM_MAP } from "@/lib/data/items";
import { STORE_MAP } from "@/lib/data/stores";
import { getWalmartOverride } from "@/lib/data/walmart-client-cache";
import { getEffectivePrice } from "@/lib/effective-price";
import { useAppStore } from "@/lib/store/use-app-store";
import type { StoreId } from "@/lib/types";
import { cn } from "@/lib/utils";

function buildDeals(): DealCardData[] {
  const { deals, source } = getDisplayDeals();

  return deals
    .map((deal): DealCardData => {
      const item = ITEM_MAP[deal.itemId];

      if (source === "live") {
        // Compare against the ShopRite baseline (what made this a "deal"
        // in the first place), not getEffectivePrice's own before/after
        // price — that reflects whether the store itself marked the
        // listing down, which is a different, unrelated question. Walmart
        // deals use its live scraped price; every other store here only
        // ever has a synthetic mock price to begin with.
        const originalPrice = item.prices.shoprite;
        const salePrice =
          deal.storeId === "walmart"
            ? (getWalmartOverride(deal.itemId)?.price ?? item.prices.walmart)
            : item.prices[deal.storeId];
        return {
          item,
          storeId: deal.storeId,
          percentOff: deal.percentOff,
          originalPrice,
          salePrice,
          savings: originalPrice - salePrice,
        };
      }

      const { price, originalPrice } = getEffectivePrice(deal.itemId, deal.storeId);
      return {
        item,
        storeId: deal.storeId,
        percentOff: deal.percentOff,
        originalPrice,
        salePrice: price,
        savings: originalPrice - price,
      };
    })
    .sort((a, b) => b.percentOff - a.percentOff);
}

export default function DealsPage() {
  const [storeFilter, setStoreFilter] = useState<StoreId | "all">("all");
  const priceVersion = useAppStore((s) => s.priceVersion);
  const allDeals = useMemo(() => buildDeals(), [priceVersion]);

  const storesWithDeals = useMemo(() => {
    const ids = Array.from(new Set(allDeals.map((d) => d.storeId)));
    return ids.map((id) => STORE_MAP[id]);
  }, [allDeals]);

  const filteredDeals =
    storeFilter === "all"
      ? allDeals
      : allDeals.filter((d) => d.storeId === storeFilter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 px-6 py-12 text-center sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 h-48 w-48 rotate-12 rounded-3xl border-4 border-dashed border-primary-foreground/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-14 -right-10 h-56 w-56 -rotate-12 rounded-3xl border-4 border-dashed border-primary-foreground/15"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15"
        >
          <Tag className="size-7 text-primary-foreground" />
        </motion.div>
        <h1 className="relative font-heading text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
          This week&apos;s deals
        </h1>
        <p className="relative mx-auto mt-2 max-w-md text-primary-foreground/85">
          {allDeals.length} standout markdowns across Rockland County stores —
          updated weekly. Add any of them straight to your list.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStoreFilter("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            storeFilter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          All stores ({allDeals.length})
        </button>
        {storesWithDeals.map((store) => {
          const count = allDeals.filter((d) => d.storeId === store.id).length;
          return (
            <button
              key={store.id}
              type="button"
              onClick={() => setStoreFilter(store.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                storeFilter === store.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: store.accent }}
              />
              {store.shortName} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDeals.map((deal, i) => (
          <DealCard key={`${deal.item.id}-${deal.storeId}`} deal={deal} index={i} />
        ))}
      </div>
    </div>
  );
}
