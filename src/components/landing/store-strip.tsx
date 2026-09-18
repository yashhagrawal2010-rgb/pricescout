import { STORES } from "@/lib/data/stores";
import { ROCKLAND_TOWNS } from "@/lib/stats";
import { Badge } from "@/components/ui/badge";

export function StoreStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-border/60 bg-card px-6 py-10 sm:px-10">
        <div className="mx-auto mb-8 max-w-xl text-center">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Every major Rockland County grocer, one screen
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick the ones near you — you&apos;re never locked into comparing all
            seven.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {STORES.map((store) => (
            <span
              key={store.id}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: store.accent }}
                aria-hidden
              />
              {store.name}
              {store.membershipRequired && (
                <Badge variant="secondary" className="text-[10px]">
                  Membership
                </Badge>
              )}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs text-muted-foreground">
          <span className="mr-1 font-medium text-foreground/70">Serving:</span>
          <span>{ROCKLAND_TOWNS.join(", ")}, and more</span>
        </div>
      </div>
    </section>
  );
}
