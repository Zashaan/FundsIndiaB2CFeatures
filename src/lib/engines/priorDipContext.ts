import type { PortfolioSnapshot } from "@/lib/data/types";
import { compareSnapshots } from "./compareSnapshots";

export interface PriorDipContext {
  date: string;
  magnitudePct: number;
  recoveredAfterPeriods: number;
}

/**
 * Scans snapshot-to-snapshot windows strictly BEFORE `currentToIndex` for one
 * with a larger market-driven decline than `currentMagnitudePct` (a positive
 * number representing the size of the current period's dip). If found, and
 * if the portfolio's value later recovered to/above its pre-dip level within
 * the dataset, returns that context. Returns null if no larger prior dip
 * exists, or if the worst one found never recovered within the dataset —
 * never fabricated, never omitted-but-implied.
 */
export function findLargerPriorDip(
  snapshots: PortfolioSnapshot[],
  currentToIndex: number,
  currentMagnitudePct: number
): PriorDipContext | null {
  let worst: { index: number; magnitudePct: number } | null = null;

  for (let i = 1; i < currentToIndex; i++) {
    const diff = compareSnapshots(snapshots[i - 1], snapshots[i]);
    const magnitudePct = -diff.marketDrivenPercentChange;
    if (magnitudePct > currentMagnitudePct && (!worst || magnitudePct > worst.magnitudePct)) {
      worst = { index: i, magnitudePct };
    }
  }
  if (!worst) return null;

  const preDipValue = snapshots[worst.index - 1].totalValue;
  let recoveredAfterPeriods = -1;
  for (let j = worst.index; j < snapshots.length; j++) {
    if (snapshots[j].totalValue >= preDipValue) {
      recoveredAfterPeriods = j - worst.index;
      break;
    }
  }
  if (recoveredAfterPeriods < 0) return null;

  return {
    date: snapshots[worst.index].date,
    magnitudePct: Math.round(worst.magnitudePct * 100) / 100,
    recoveredAfterPeriods,
  };
}
