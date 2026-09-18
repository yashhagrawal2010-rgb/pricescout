"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroPriceCard, type HeroPriceRow } from "@/components/landing/hero-price-card";

export function Hero({ demoRows }: { demoRows: HeroPriceRow[] }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            <Sparkles className="size-3.5" />
            Free · No account needed · Rockland County, NY
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Stop overpaying for the same groceries.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 max-w-lg text-lg text-muted-foreground"
          >
            PriceScout compares real-time prices across Stop &amp; Shop,
            ShopRite, Walmart, Costco, Aldi, Trader Joe&apos;s, and Key Food —
            then builds the shopping list that costs you the least.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              render={<Link href="/list" />}
              nativeButton={false}
              size="lg"
              className="rounded-full px-7 text-base font-semibold shadow-lg shadow-primary/25"
            >
              Start comparing
              <ArrowRight className="size-4" />
            </Button>
            <Button
              render={<Link href="#how-it-works" />}
              nativeButton={false}
              size="lg"
              variant="outline"
              className="rounded-full px-7 text-base font-semibold"
            >
              See how it works
            </Button>
          </motion.div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPriceCard rows={demoRows} />
        </div>
      </div>
    </section>
  );
}
