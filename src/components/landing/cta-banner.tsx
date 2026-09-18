import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-xl shadow-primary/20 sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-primary-foreground/10 blur-2xl"
        />
        <h2 className="relative font-heading text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
          Your grocery bill just got a second opinion.
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-primary-foreground/85">
          Build your list in under a minute and see exactly where to shop this
          week.
        </p>
        <Button
          render={<Link href="/list" />}
          nativeButton={false}
          size="lg"
          variant="secondary"
          className="relative mt-8 rounded-full px-8 text-base font-semibold"
        >
          Build my shopping list
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}
