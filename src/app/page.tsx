import { Hero } from "@/components/landing/hero";
import { StatsStrip } from "@/components/landing/stats-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StoreStrip } from "@/components/landing/store-strip";
import { CtaBanner } from "@/components/landing/cta-banner";
import type { HeroPriceRow } from "@/components/landing/hero-price-card";
import { ITEM_MAP } from "@/lib/data/items";
import { STORE_MAP } from "@/lib/data/stores";
import { getAverageItemSavingsPercent } from "@/lib/stats";
import { ITEMS } from "@/lib/data/items";
import type { StoreId } from "@/lib/types";

const DEMO_ITEM_IDS = ["whole-milk", "chicken-breast", "large-eggs"];
const DEMO_STORE_IDS: StoreId[] = ["shoprite", "stopandshop", "aldi"];

function buildDemoRows(): HeroPriceRow[] {
  return DEMO_ITEM_IDS.map((itemId) => {
    const item = ITEM_MAP[itemId];
    const prices = DEMO_STORE_IDS.map((storeId) => item.prices[storeId]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {
      name: item.name,
      icon: item.icon,
      unit: item.unit,
      cells: DEMO_STORE_IDS.map((storeId) => {
        const price = item.prices[storeId];
        const tier = price === min ? "best" : price === max ? "worst" : "mid";
        return {
          storeShortName: STORE_MAP[storeId].shortName,
          price,
          tier: tier as "best" | "mid" | "worst",
        };
      }),
    };
  });
}

export default function Home() {
  const demoRows = buildDemoRows();
  const avgSavingsPercent = getAverageItemSavingsPercent();

  return (
    <div className="flex flex-1 flex-col">
      <Hero demoRows={demoRows} />
      <StatsStrip
        storeCount={Object.keys(STORE_MAP).length}
        itemCount={ITEMS.length}
        avgSavingsPercent={avgSavingsPercent}
      />
      <HowItWorks />
      <StoreStrip />
      <CtaBanner />
    </div>
  );
}
