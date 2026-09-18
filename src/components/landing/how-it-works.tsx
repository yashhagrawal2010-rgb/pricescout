"use client";

import { motion } from "framer-motion";
import { ListChecks, SlidersHorizontal, Store, Wallet } from "lucide-react";
import { ITEMS } from "@/lib/data/items";

const STEPS = [
  {
    icon: Store,
    title: "Pick your stores",
    description:
      "Choose which of the 7 local chains you actually shop at — no need to compare places you'll never go.",
  },
  {
    icon: ListChecks,
    title: "Build your list",
    description:
      `Search ${ITEMS.length}+ common items or browse by category. Every item shows a live price at each store you selected.`,
  },
  {
    icon: SlidersHorizontal,
    title: "Tune the optimizer",
    description:
      "Tell us how many stores you're willing to visit. We'll only suggest splitting your trip if it actually pays off.",
  },
  {
    icon: Wallet,
    title: "See what you saved",
    description:
      "Get the cheapest store combination for your exact list, with a clear dollar amount saved vs. the priciest option.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 scroll-mt-20">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Four steps to a cheaper cart
        </h2>
        <p className="mt-3 text-muted-foreground">
          No spreadsheets, no app-hopping between store flyers. Just tell us
          what&apos;s on your list.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <step.icon className="size-5" />
            </div>
            <span className="absolute right-5 top-5 font-heading text-2xl font-extrabold text-muted-foreground/20">
              0{i + 1}
            </span>
            <h3 className="font-heading text-lg font-bold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
