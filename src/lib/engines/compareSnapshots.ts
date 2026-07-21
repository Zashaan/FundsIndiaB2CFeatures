import type { AssetClass, Fund, PortfolioSnapshot, Transaction } from "@/lib/data/types";
import { getFundById, getNavOnOrBefore, getTransactionsInRange } from "@/lib/data/repository";

export interface HoldingDelta {
  fundId: string;
  fundName: string;
  valueBefore: number;
  valueAfter: number;
  /** Raw position value change — includes any contributions/redemptions in the window. */
  absoluteChange: number;
  /** Pure NAV return for this fund (fund performance only, unaffected by units bought/sold). */
  percentChange: number;
}

export interface AllocationDriftEntry {
  before: number;
  after: number;
  delta: number;
}

export interface SnapshotDiff {
  from: PortfolioSnapshot;
  to: PortfolioSnapshot;
  totalValueBefore: number;
  totalValueAfter: number;
  /** Raw total value change, including any contributions/redemptions in the window. */
  absoluteChange: number;
  percentChange: number;
  /** Net money added (positive) or withdrawn (negative) via transactions in the window. */
  netInvestment: number;
  /** Change attributable purely to market movement, with net investment backed out. */
  marketDrivenChange: number;
  marketDrivenPercentChange: number;
  allocationDrift: Record<AssetClass, AllocationDriftEntry>;
  holdingDeltas: HoldingDelta[];
  hadTransactionsInWindow: boolean;
  transactionsInWindow: Transaction[];
}

function valueOfHolding(fundId: string, units: number, asOfDate: string): number {
  const nav = getNavOnOrBefore(fundId, asOfDate) ?? 0;
  return units * nav;
}

export function compareSnapshots(from: PortfolioSnapshot, to: PortfolioSnapshot): SnapshotDiff {
  const fundIds = Array.from(
    new Set([...from.holdings.map((h) => h.fundId), ...to.holdings.map((h) => h.fundId)])
  );

  const holdingDeltas: HoldingDelta[] = fundIds.map((fundId) => {
    const fund = getFundById(fundId) as Fund;
    const unitsBefore = from.holdings.find((h) => h.fundId === fundId)?.units ?? 0;
    const unitsAfter = to.holdings.find((h) => h.fundId === fundId)?.units ?? 0;
    const valueBefore = valueOfHolding(fundId, unitsBefore, from.date);
    const valueAfter = valueOfHolding(fundId, unitsAfter, to.date);
    const absoluteChange = valueAfter - valueBefore;

    const navBefore = getNavOnOrBefore(fundId, from.date) ?? 0;
    const navAfter = getNavOnOrBefore(fundId, to.date) ?? 0;
    const percentChange = navBefore === 0 ? 0 : ((navAfter - navBefore) / navBefore) * 100;

    return {
      fundId,
      fundName: fund?.name ?? fundId,
      valueBefore: round2(valueBefore),
      valueAfter: round2(valueAfter),
      absoluteChange: round2(absoluteChange),
      percentChange: round2(percentChange),
    };
  });

  const totalValueBefore = from.totalValue;
  const totalValueAfter = to.totalValue;
  const absoluteChange = round2(totalValueAfter - totalValueBefore);
  const percentChange = round2((absoluteChange / totalValueBefore) * 100);

  const transactionsInWindow = getTransactionsInRange(from.date, to.date);
  const netInvestment = round2(
    transactionsInWindow.reduce((sum, t) => sum + (t.type === "sell" ? -t.amount : t.amount), 0)
  );
  const marketDrivenChange = round2(absoluteChange - netInvestment);
  const marketDrivenPercentChange =
    totalValueBefore === 0 ? 0 : round2((marketDrivenChange / totalValueBefore) * 100);

  const assetClasses: AssetClass[] = ["equity", "debt", "international", "liquid", "gold"];
  const allocationDrift = Object.fromEntries(
    assetClasses.map((ac) => {
      const before = from.allocation[ac] ?? 0;
      const after = to.allocation[ac] ?? 0;
      return [ac, { before, after, delta: round2(after - before) }];
    })
  ) as Record<AssetClass, AllocationDriftEntry>;

  return {
    from,
    to,
    totalValueBefore,
    totalValueAfter,
    absoluteChange,
    percentChange,
    netInvestment,
    marketDrivenChange,
    marketDrivenPercentChange,
    allocationDrift,
    holdingDeltas,
    hadTransactionsInWindow: transactionsInWindow.length > 0,
    transactionsInWindow,
  };
}

export function getBiggestMovers(diff: SnapshotDiff, limit = 3) {
  const withMovement = diff.holdingDeltas.filter((h) => h.valueBefore > 0);
  const sorted = [...withMovement].sort((a, b) => b.percentChange - a.percentChange);
  const gainers = sorted.filter((h) => h.percentChange > 0).slice(0, limit);
  const decliners = sorted
    .filter((h) => h.percentChange < 0)
    .slice(-limit)
    .reverse();
  return { gainers, decliners };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
