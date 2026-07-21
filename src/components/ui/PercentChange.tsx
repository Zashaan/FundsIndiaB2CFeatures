export function PercentChange({ value, className = "" }: { value: number; className?: string }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const color = isNeutral ? "text-slate-500" : isPositive ? "text-emerald-600" : "text-rose-600";
  const arrow = isNeutral ? "" : isPositive ? "▲" : "▼";
  return (
    <span className={`font-medium ${color} ${className}`}>
      {arrow} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatInrSigned(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatInr(Math.abs(value))}`;
}
