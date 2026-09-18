import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-heading font-extrabold tracking-tight",
        className
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-base shadow-sm">
        $
      </span>
      <span>
        Price<span className="text-primary">Scout</span>
      </span>
    </span>
  );
}
