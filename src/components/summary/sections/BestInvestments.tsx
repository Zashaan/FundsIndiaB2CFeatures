import { PercentChange } from "@/components/ui/PercentChange";
import type { HoldingDelta } from "@/lib/engines/compareSnapshots";

export function BestInvestments({
  gainers,
  reasons,
}: {
  gainers: HoldingDelta[];
  reasons?: Record<string, string>;
}) {
  if (gainers.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {gainers.map((g) => (
        <div key={g.fundId} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            ₹
          </div>
          <p className="line-clamp-2 text-sm font-medium text-slate-900">{g.fundName}</p>
          <p className="mt-1 text-base font-semibold">
            <PercentChange value={g.percentChange} />
          </p>
          {reasons?.[g.fundId] && <p className="mt-1 text-xs text-slate-500">{reasons[g.fundId]}</p>}
        </div>
      ))}
    </div>
  );
}
