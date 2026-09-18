"use client";

import { useEffect } from "react";
import { setWalmartOverrides, type WalmartOverride } from "@/lib/data/walmart-client-cache";
import { useAppStore } from "@/lib/store/use-app-store";

const MAX_AGE_HOURS = 36;

// Fetches whatever the daily scraper last pushed and layers it on top of
// the bundled mock prices. Silently does nothing if the fetch fails or
// there's no data yet — the app already works fine on mock prices alone.
export function WalmartPriceSync() {
  const bumpPriceVersion = useAppStore((s) => s.bumpPriceVersion);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/walmart-prices")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, WalmartOverride>) => {
        if (cancelled) return;
        const now = Date.now();
        const fresh = Object.fromEntries(
          Object.entries(data).filter(([, entry]) => {
            const ageHours = (now - new Date(entry.scrapedAt).getTime()) / 36e5;
            return ageHours <= MAX_AGE_HOURS;
          })
        );
        if (Object.keys(fresh).length > 0) {
          setWalmartOverrides(fresh);
          bumpPriceVersion();
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [bumpPriceVersion]);

  return null;
}
