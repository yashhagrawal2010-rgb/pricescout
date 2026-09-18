"use client";

import { StoreSelector } from "@/components/list/store-selector";
import { PriceTable } from "@/components/compare/price-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store/use-app-store";

export default function ComparePage() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const listCount = useAppStore((s) => s.list.length);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Compare prices
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Side-by-side pricing for every item at every store you&apos;ve selected.
        </p>
      </div>

      {!hasHydrated ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-36 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
              Stores
            </h2>
            <StoreSelector />
          </section>

          <Tabs defaultValue={listCount > 0 ? "list" : "all"}>
            <TabsList>
              <TabsTrigger value="list">My list ({listCount})</TabsTrigger>
              <TabsTrigger value="all">All items</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-5">
              <PriceTable scope="list" />
            </TabsContent>
            <TabsContent value="all" className="mt-5">
              <PriceTable scope="all" />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
