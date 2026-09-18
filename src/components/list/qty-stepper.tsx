"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QtyStepper({
  qty,
  onChange,
  size = "default",
}: {
  qty: number;
  onChange: (qty: number) => void;
  size?: "default" | "sm";
}) {
  return (
    <div
      className={
        size === "sm"
          ? "flex items-center gap-1"
          : "flex items-center gap-1.5"
      }
    >
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        className="rounded-full"
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3" />
      </Button>
      <span className="w-5 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        className="rounded-full"
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}
