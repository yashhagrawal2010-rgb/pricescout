"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface HeroPriceRow {
  name: string;
  icon: string;
  unit: string;
  cells: { storeShortName: string; price: number; tier: "best" | "mid" | "worst" }[];
}

const TIER_STYLES: Record<HeroPriceRow["cells"][number]["tier"], string> = {
  best: "bg-price-best text-price-best-foreground",
  mid: "bg-price-mid text-price-mid-foreground",
  worst: "bg-price-worst text-price-worst-foreground",
};

export function HeroPriceCard({ rows }: { rows: HeroPriceRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      whileHover={{ rotate: 0, y: -4 }}
      className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-5 shadow-2xl shadow-primary/10"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-heading text-sm font-bold text-foreground">
          Your list, compared live
        </p>
        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
            className="flex items-center gap-3"
          >
            <span className="text-xl">{row.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {row.name}
              </p>
              <p className="text-xs text-muted-foreground">{row.unit}</p>
            </div>
            <div className="flex gap-1.5">
              {row.cells.map((cell) => (
                <span
                  key={cell.storeShortName}
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-semibold tabular-nums",
                    TIER_STYLES[cell.tier]
                  )}
                  title={cell.storeShortName}
                >
                  {formatCurrency(cell.price)}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
