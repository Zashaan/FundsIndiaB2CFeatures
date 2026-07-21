import { PercentChange } from "@/components/ui/PercentChange";
import type { HoldingDelta } from "@/lib/engines/compareSnapshots";

export function MoverCard({ mover, reason }: { mover: HoldingDelta; reason?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-900">{mover.fundName}</p>
        <PercentChange value={mover.percentChange} />
      </div>
      {reason && <p className="mt-1.5 text-sm text-slate-500">{reason}</p>}
    </div>
  );
}
