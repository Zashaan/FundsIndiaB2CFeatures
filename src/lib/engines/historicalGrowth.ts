import type { Holding } from "@/lib/data/types";
import { getLongTermNavOnOrBefore, getNavOnOrBefore } from "@/lib/data/repository";

export interface HistoricalGrowthPoint {
  yearsAgo: number;
  valueThen: number;
  valueNow: number;
  pctChange: number;
}

/** Moves an ISO date (YYYY-MM-DD) back by exactly N years. */
export function subtractYears(dateIso: string, years: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d.toISOString().slice(0, 10);
}

function valueOfHoldingsAt(holdings: Holding[], date: string): number {
  return holdings.reduce((sum, h) => {
    const nav = getLongTermNavOnOrBefore(h.fundId, date) ?? getNavOnOrBefore(h.fundId, date) ?? 0;
    return sum + h.units * nav;
  }, 0);
}

/**
 * "If you'd stayed invested" illustration: prices the user's CURRENT
 * holdings against the long-term NAV at each requested past date, compared
 * to their real current value. Always computed for every year requested —
 * callers must not filter this list by favorability (see design spec's
 * compliance rationale).
 */
export function computeHistoricalGrowth(
  holdings: Holding[],
  asOfDate: string,
  valueNow: number,
  yearsAgoList: number[]
): HistoricalGrowthPoint[] {
  return yearsAgoList.map((yearsAgo) => {
    const pastDate = subtractYears(asOfDate, yearsAgo);
    const valueThen = valueOfHoldingsAt(holdings, pastDate);
    const pctChange = valueThen === 0 ? 0 : ((valueNow - valueThen) / valueThen) * 100;
    return {
      yearsAgo,
      valueThen: Math.round(valueThen * 100) / 100,
      valueNow: Math.round(valueNow * 100) / 100,
      pctChange: Math.round(pctChange * 100) / 100,
    };
  });
}
