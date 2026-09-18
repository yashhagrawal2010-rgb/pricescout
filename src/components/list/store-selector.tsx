"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { STORES } from "@/lib/data/stores";
import { useAppStore } from "@/lib/store/use-app-store";
import { cn } from "@/lib/utils";

export function StoreSelector() {
  const selectedStores = useAppStore((s) => s.selectedStores);
  const toggleStore = useAppStore((s) => s.toggleStore);

  return (
    <div className="flex flex-wrap gap-2.5">
      {STORES.map((store) => {
        const active = selectedStores.includes(store.id);
        return (
          <motion.button
            key={store.id}
            type="button"
            onClick={() => toggleStore(store.id)}
            whileTap={{ scale: 0.95 }}
            aria-pressed={active}
            className={cn(
              "group relative flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-left transition-colors",
              active
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-accent/60"
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: store.accent }}
              aria-hidden
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-semibold leading-tight",
                  active ? "text-primary" : "text-foreground"
                )}
              >
                {store.shortName}
              </p>
              <p className="flex items-center gap-1 text-[11px] leading-tight text-muted-foreground">
                {store.membershipRequired && <Lock className="size-2.5" />}
                {store.tagline}
              </p>
            </div>
            {active && (
              <motion.span
                layoutId={`check-${store.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Check className="size-3" strokeWidth={3} />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
