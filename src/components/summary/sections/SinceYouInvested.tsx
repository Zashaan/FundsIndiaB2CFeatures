import { formatInr, PercentChange } from "@/components/ui/PercentChange";
import type { HistoricalGrowthPoint } from "@/lib/engines/historicalGrowth";

export function SinceYouInvested({ points }: { points: HistoricalGrowthPoint[] }) {
  if (points.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {points.map((p) => (
          <div key={p.yearsAgo} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{p.yearsAgo}Y AGO</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatInr(p.valueThen)}</p>
            <p className="mt-1 flex justify-center">
              <PercentChange value={p.pctChange} />
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Historical illustration based on your current fund mix — not a prediction, and past performance
        doesn&apos;t guarantee future returns.
      </p>
    </div>
  );
}
