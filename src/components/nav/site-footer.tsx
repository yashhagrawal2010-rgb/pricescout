import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo className="text-base" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Free grocery price comparison for Rockland County, NY. Prototype
            with mock pricing data — built for a competition demo.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/list" className="hover:text-foreground">
            Shopping List
          </Link>
          <Link href="/compare" className="hover:text-foreground">
            Compare Prices
          </Link>
          <Link href="/deals" className="hover:text-foreground">
            Weekly Deals
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} PriceScout · No government, just smart
        consumer choice.
      </div>
    </footer>
  );
}
