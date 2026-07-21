import { getSnapshots } from "@/lib/data/repository";
import { compareSnapshots } from "@/lib/engines/compareSnapshots";
import { computeHistoricalGrowth } from "@/lib/engines/historicalGrowth";
import type { SummaryCadence, SummaryDescriptor } from "./types";

function buildHook(marketPct: number): string {
  if (marketPct > 0.5) return "Your investments moved up — staying invested paid off.";
  if (marketPct >= -0.5) return "A steady period for your portfolio — right on track.";
  return "A small, normal dip — a common short-term market move.";
}

function describe(
  cadence: SummaryCadence,
  fromIdx: number,
  toIdx: number,
  snapshots: ReturnType<typeof getSnapshots>
): SummaryDescriptor {
  const from = snapshots[fromIdx];
  const to = snapshots[toIdx];
  const diff = compareSnapshots(from, to);
  return {
    id: `${cadence}-${to.id}`,
    cadence,
    date: to.date,
    fromSnapshotId: from.id,
    toSnapshotId: to.id,
    headlinePct: diff.marketDrivenPercentChange,
    hook: buildHook(diff.marketDrivenPercentChange),
  };
}

const YEARLY_LOOKBACKS = [1, 2, 3, 4, 5];

function getYearlySummaryList(): SummaryDescriptor[] {
  const snapshots = getSnapshots();
  const latest = snapshots[snapshots.length - 1];
  return YEARLY_LOOKBACKS.map((yearsAgo) => {
    const points = computeHistoricalGrowth(latest.holdings, latest.date, latest.totalValue, [yearsAgo]);
    const point = points[0];
    return {
      id: `yearly-${yearsAgo}y`,
      cadence: "yearly" as const,
      date: subtractYearsForDate(latest.date, yearsAgo),
      fromSnapshotId: latest.id,
      toSnapshotId: latest.id,
      headlinePct: point.pctChange,
      hook: `Your current portfolio mix would have grown ${Math.abs(point.pctChange).toFixed(1)}% over ${yearsAgo} year${
        yearsAgo > 1 ? "s" : ""
      }.`,
    };
  });
}

function subtractYearsForDate(dateIso: string, years: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d.toISOString().slice(0, 10);
}

/** Newest-first list of browsable summaries for the given cadence. */
export function getSummaryList(cadence: SummaryCadence): SummaryDescriptor[] {
  if (cadence === "yearly") return getYearlySummaryList();

  const snapshots = getSnapshots();
  const out: SummaryDescriptor[] = [];
  const step = cadence === "monthly" ? 2 : 1; // weekly=1, monthly=2
  for (let to = snapshots.length - 1; to - step >= 0; to -= step) {
    out.push(describe(cadence, to - step, to, snapshots));
  }
  return out; // already newest-first because we walk downward
}

export function getLatestSummary(): SummaryDescriptor | null {
  return getSummaryList("weekly")[0] ?? null;
}

export function getDescriptorById(id: string): SummaryDescriptor | null {
  const cadence: SummaryCadence = id.startsWith("yearly-") ? "yearly" : id.startsWith("monthly-") ? "monthly" : "weekly";
  return getSummaryList(cadence).find((d) => d.id === id) ?? null;
}
