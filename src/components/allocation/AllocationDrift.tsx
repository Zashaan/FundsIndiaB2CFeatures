import { Card, SectionHeading } from "@/components/ui/Card";
import type { SnapshotDiff } from "@/lib/engines/compareSnapshots";
import type { AssetClass } from "@/lib/data/types";

const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  equity: "Equity",
  debt: "Debt",
  international: "International",
  liquid: "Liquid",
  gold: "Gold",
};

const ASSET_CLASS_ORDER: AssetClass[] = ["equity", "debt", "international", "liquid", "gold"];

export function AllocationDrift({ diff, hadTransactionsInWindow }: { diff: SnapshotDiff; hadTransactionsInWindow: boolean }) {
  return (
    <Card>
      <SectionHeading title="What Changed Inside Your Portfolio?" subtitle="Allocation now vs. your last visit." />
      <div className="space-y-3">
        {ASSET_CLASS_ORDER.map((ac) => {
          const entry = diff.allocationDrift[ac];
          if (entry.before === 0 && entry.after === 0) return null;
          const deltaLabel =
            entry.delta === 0 ? "No change" : `${entry.delta > 0 ? "▲" : "▼"} ${Math.abs(entry.delta).toFixed(1)}%`;
          const deltaColor = entry.delta === 0 ? "text-slate-400" : entry.delta > 0 ? "text-emerald-600" : "text-rose-600";
          return (
            <div key={ac} className="flex items-center justify-between text-sm">
              <span className="w-28 shrink-0 font-medium text-slate-700">{ASSET_CLASS_LABEL[ac]}</span>
              <div className="flex flex-1 items-center gap-2 text-slate-500">
                <span>{entry.before}%</span>
                <span>→</span>
                <span className="font-medium text-slate-900">{entry.after}%</span>
              </div>
              <span className={`w-24 text-right font-medium ${deltaColor}`}>{deltaLabel}</span>
            </div>
          );
        })}
      </div>
      {!hadTransactionsInWindow && (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
          Your allocation changed because the market value of your investments changed — you made no
          transactions during this period.
        </p>
      )}
    </Card>
  );
}
