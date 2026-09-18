"use client";

import { StoreSelector } from "@/components/list/store-selector";
import { ItemBrowser } from "@/components/list/item-browser";
import { ShoppingList } from "@/components/list/shopping-list";
import { SavingsSummary } from "@/components/list/savings-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store/use-app-store";

export default function ListPage() {
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Build your shopping list
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick your stores, add what you need, and we&apos;ll figure out the
          cheapest way to buy it.
        </p>
      </div>

      {!hasHydrated ? (
        <ListPageSkeleton />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
                1. Choose your stores
              </h2>
              <StoreSelector />
            </section>

            <section>
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
                Your list
              </h2>
              <ShoppingList />
            </section>

            <section>
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
                2. Add items
              </h2>
              <ItemBrowser />
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SavingsSummary />
          </aside>
        </div>
      )}
    </div>
  );
}

function ListPageSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-36 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
