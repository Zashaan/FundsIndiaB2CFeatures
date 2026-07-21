import type { SnapshotDiff } from "@/lib/engines/compareSnapshots";
import type { AssetClass } from "@/lib/data/types";

const LABEL: Record<AssetClass, string> = {
  equity: "Equity",
  debt: "Debt",
  international: "International",
  liquid: "Liquid",
  gold: "Gold",
};
const ORDER: AssetClass[] = ["equity", "debt", "international", "liquid", "gold"];

export function WhatChangedTable({ diff }: { diff: SnapshotDiff }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
          <th className="pb-2 font-medium">Holding</th>
          <th className="pb-2 text-right font-medium">Before</th>
          <th className="pb-2 text-right font-medium">Now</th>
          <th className="pb-2 text-right font-medium">Change</th>
        </tr>
      </thead>
      <tbody>
        {ORDER.map((ac) => {
          const e = diff.allocationDrift[ac];
          if (e.before === 0 && e.after === 0) return null;
          const label = e.delta === 0 ? "normal" : e.delta > 0 ? `▲ ${Math.abs(e.delta).toFixed(1)}%` : `▼ ${Math.abs(e.delta).toFixed(1)}%`;
          const color = e.delta > 0 ? "text-emerald-600" : e.delta < 0 ? "text-slate-500" : "text-slate-400";
          return (
            <tr key={ac} className="border-t border-slate-100">
              <td className="py-2 font-medium text-slate-700">{LABEL[ac]}</td>
              <td className="py-2 text-right text-slate-500">{e.before}%</td>
              <td className="py-2 text-right text-slate-900">{e.after}%</td>
              <td className={`py-2 text-right font-medium ${color}`}>{label}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
