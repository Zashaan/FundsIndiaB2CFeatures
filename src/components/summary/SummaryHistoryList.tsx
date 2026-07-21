"use client";

import { useEffect, useState } from "react";
import type { SummaryCadence, SummaryDescriptor } from "@/lib/summary/types";
import { PercentChange } from "@/components/ui/PercentChange";
import { useSummaryContext } from "@/lib/summary/summaryContext";

type SortMode = "recent" | "best";
const CADENCES: SummaryCadence[] = ["weekly", "monthly", "yearly"];

export function SummaryHistoryList() {
  const [cadence, setCadence] = useState<SummaryCadence>("weekly");
  const [sort, setSort] = useState<SortMode>("recent");
  const [items, setItems] = useState<SummaryDescriptor[]>([]);
  const { openDescriptor } = useSummaryContext();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/summaries?cadence=${cadence}`)
      .then((r) => r.json())
      .then((j) => !cancelled && j.success && setItems(j.data as SummaryDescriptor[]))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cadence]);

  const sorted = sort === "best" ? [...items].sort((a, b) => b.headlinePct - a.headlinePct) : items;

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex gap-2">
        {CADENCES.map((c) => (
          <button
            key={c}
            onClick={() => setCadence(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              cadence === c ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setSort((s) => (s === "recent" ? "best" : "recent"))}
          className="ml-auto rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600"
        >
          {sort === "recent" ? "Sort: Recent" : "Sort: Best"}
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {sorted.map((d) =>
          cadence === "yearly" ? (
            <div key={d.id} className="w-56 shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left">
              <span className="block text-sm font-medium text-slate-900">
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(
                  new Date(d.date)
                )}
              </span>
              <span className="mt-0.5 block text-sm text-slate-500">{d.hook}</span>
              <span className="mt-2 block">
                <PercentChange value={d.headlinePct} />
              </span>
            </div>
          ) : (
            <button
              key={d.id}
              onClick={() => openDescriptor(d.id)}
              className="w-56 shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left"
            >
              <span className="block text-sm font-medium text-slate-900">
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" }).format(new Date(d.date))}
              </span>
              <span className="mt-0.5 block text-sm text-slate-500">{d.hook}</span>
              <span className="mt-2 block">
                <PercentChange value={d.headlinePct} />
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
