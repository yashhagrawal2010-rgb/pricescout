"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Info,
  PiggyBank,
  Route,
  Share2,
  Sparkles,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CountUp } from "@/components/count-up";
import { STORE_MAP } from "@/lib/data/stores";
import { computeOptimizerResult } from "@/lib/optimizer";
import { formatCurrency } from "@/lib/format";
import { buildShareText } from "@/lib/share";
import { useAppStore } from "@/lib/store/use-app-store";
import { cn } from "@/lib/utils";

export function SavingsSummary() {
  const list = useAppStore((s) => s.list);
  const selectedStores = useAppStore((s) => s.selectedStores);
  const maxStores = useAppStore((s) => s.maxStores);
  const tripCost = useAppStore((s) => s.tripCost);
  const setMaxStores = useAppStore((s) => s.setMaxStores);
  const setTripCost = useAppStore((s) => s.setTripCost);
  const priceVersion = useAppStore((s) => s.priceVersion);

  const result = useMemo(
    () => computeOptimizerResult(list, selectedStores, { maxStores, tripCost }),
    [list, selectedStores, maxStores, tripCost, priceVersion]
  );

  const storeCap = Math.max(1, Math.min(4, selectedStores.length));

  if (selectedStores.length === 0 || list.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
        <PiggyBank className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-2 font-heading font-bold text-foreground">
          Savings summary
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedStores.length === 0
            ? "Select stores and add items to see your optimized plan."
            : "Add items to your list to see your optimized plan."}
        </p>
      </div>
    );
  }

  if (!result) return null;

  const sortedTotals = [...result.singleStoreTotals].sort((a, b) => a.total - b.total);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", {
        description: "Paste it anywhere to share your plan.",
      });
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  async function handleShare() {
    if (!result) return;
    const text = buildShareText(result);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My PriceScout shopping list", text });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    await copyToClipboard(text);
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
      <div>
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles className="size-4" />
          <p className="text-xs font-semibold uppercase tracking-wide">
            Optimized plan
          </p>
        </div>
        <p className="mt-2 font-heading text-3xl font-extrabold text-foreground">
          <CountUp value={result.optimalTotal} prefix="$" decimals={2} duration={0.8} />
        </p>
        {result.mostExpensiveSingleStore && (
          <p className="mt-1 text-sm text-muted-foreground">
            vs.{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(result.mostExpensiveSingleStore.total)}
            </span>{" "}
            at {STORE_MAP[result.mostExpensiveSingleStore.storeId].shortName}{" "}
            alone
          </p>
        )}
      </div>

      {result.savingsVsMostExpensive > 0.004 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-price-best px-4 py-3 text-price-best-foreground"
        >
          <p className="text-sm font-semibold">
            You save{" "}
            <CountUp
              value={result.savingsVsMostExpensive}
              prefix="$"
              decimals={2}
              duration={0.9}
            />{" "}
            ({Math.round(result.percentSavedVsMostExpensive)}%)
          </p>
          <p className="text-xs opacity-80">
            vs. buying this list entirely at the priciest store
          </p>
        </motion.div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {result.isSplitWorthIt ? "Recommended trip" : "Recommended store"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.optimalStoreIds.map((storeId) => (
            <span
              key={storeId}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STORE_MAP[storeId].accent }}
              />
              {STORE_MAP[storeId].shortName}
            </span>
          ))}
        </div>
        {result.isSplitWorthIt && (
          <p className="text-xs text-muted-foreground">
            Splitting your trip across {result.optimalStoreIds.length} stores
            beats any single store, even after accounting for the hassle of
            an extra stop.
          </p>
        )}
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex items-center gap-1.5">
          <Route className="size-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trip settings
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">
              Max stores you&apos;ll visit
            </label>
            <span className="text-xs font-semibold text-primary">
              {storeCap === 1 ? 1 : Math.min(maxStores, storeCap)}
            </span>
          </div>
          <Slider
            value={Math.min(maxStores, storeCap)}
            onValueChange={(v) => setMaxStores(Array.isArray(v) ? v[0] : v)}
            min={1}
            max={storeCap}
            step={1}
            disabled={storeCap === 1}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            We&apos;ll never suggest splitting your trip across more stores
            than this, even if going further would save a little more.
          </p>
        </div>

        <div className="space-y-2 rounded-xl bg-muted/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-medium text-foreground">
                Cost of an extra stop
              </label>
              <Tooltip>
                <TooltipTrigger className="text-muted-foreground hover:text-foreground">
                  <Info className="size-3.5" />
                  <span className="sr-only">What does this mean?</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-60 text-xs leading-relaxed">
                  Your estimate for the gas, time, and hassle of driving to
                  one more store. We charge this as a penalty against any
                  multi-store plan — so splitting only gets recommended when
                  the grocery savings are bigger than this cost.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs font-semibold text-primary">
              {formatCurrency(tripCost)}
            </span>
          </div>
          <Slider
            value={tripCost}
            onValueChange={(v) => setTripCost(Array.isArray(v) ? v[0] : v)}
            min={0}
            max={15}
            step={1}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            e.g. splitting into 2 stores only gets recommended if it saves
            more than {formatCurrency(tripCost)} on groceries.
          </p>
          {selectedStores.length > 1 && (
            <p
              className={cn(
                "text-[11px] font-medium",
                result.isSplitWorthIt
                  ? "text-price-best-foreground"
                  : "text-muted-foreground"
              )}
            >
              {result.isSplitWorthIt
                ? `✓ For this list, splitting clears your ${formatCurrency(tripCost)} stop cost.`
                : `Splitting wouldn't beat your ${formatCurrency(tripCost)} stop cost right now — keeping it to one store.`}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Total by store
        </p>
        {sortedTotals.map((row, i) => {
          const tier =
            i === 0 ? "best" : i === sortedTotals.length - 1 ? "worst" : "mid";
          const widthPct = (row.total / sortedTotals[sortedTotals.length - 1].total) * 100;
          return (
            <div key={row.storeId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {STORE_MAP[row.storeId].shortName}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(row.total)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "h-full rounded-full",
                    tier === "best" && "bg-price-best-foreground/70",
                    tier === "mid" && "bg-price-mid-foreground/60",
                    tier === "worst" && "bg-price-worst-foreground/70"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-xl"
          onClick={handleShare}
        >
          <Share2 className="size-4" />
          Share my plan
        </Button>
        <Button
          render={<Link href="/compare" />}
          nativeButton={false}
          variant="outline"
          className="w-full rounded-xl"
        >
          See full price comparison
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
