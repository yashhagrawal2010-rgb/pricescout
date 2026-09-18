export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
