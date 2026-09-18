import { CountUp } from "@/components/count-up";

export function StatsStrip({
  storeCount,
  itemCount,
  avgSavingsPercent,
}: {
  storeCount: number;
  itemCount: number;
  avgSavingsPercent: number;
}) {
  const stats = [
    { value: storeCount, suffix: "", decimals: 0, label: "Rockland County stores compared" },
    { value: itemCount, suffix: "+", decimals: 0, label: "everyday grocery items tracked" },
    {
      value: avgSavingsPercent,
      suffix: "%",
      decimals: 0,
      label: "average price gap between the cheapest and priciest store, per item",
    },
  ];

  return (
    <section className="border-y border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <CountUp
              value={stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals}
              className="font-heading text-4xl font-extrabold text-primary tabular-nums"
            />
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
