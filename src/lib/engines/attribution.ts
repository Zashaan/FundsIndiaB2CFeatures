import type { Holding, MacroEvent, MacroEventCategory } from "@/lib/data/types";
import { getFundById, getNavOnOrBefore } from "@/lib/data/repository";

export interface AttributionFactor {
  category: MacroEventCategory;
  label: string;
  weightPct: number;
  contributingEvents: MacroEvent[];
}

const CATEGORY_LABEL: Record<MacroEventCategory, string> = {
  market_correction: "Market-wide correction",
  sector_movement: "Sector movement",
  rate_expectations: "RBI interest rate expectations",
  global_markets: "US / global market performance",
  currency: "Currency fluctuations",
};

/**
 * Heuristic (not real quant) mapping from macro events -> attribution
 * percentages. Each event's "exposure score" is how much of the user's actual
 * holding value it plausibly touches, weighted by the event's magnitude.
 * Scores are grouped by category and normalized to sum to 100%.
 */
export function computeAttribution(
  holdings: Holding[],
  totalValue: number,
  eventsInWindow: MacroEvent[],
  asOfDate: string
): AttributionFactor[] {
  const holdingWeights = holdings.map((h) => {
    const fund = getFundById(h.fundId);
    const nav = getNavOnOrBefore(h.fundId, asOfDate) ?? 0;
    const value = h.units * nav;
    return { fund, weight: totalValue === 0 ? 0 : value / totalValue };
  });

  const scoreByCategory = new Map<MacroEventCategory, number>();
  const eventsByCategory = new Map<MacroEventCategory, MacroEvent[]>();

  for (const event of eventsInWindow) {
    let exposureScore = 0;
    for (const { fund, weight } of holdingWeights) {
      if (!fund) continue;
      const sectorMatch = event.relatedSectors.some((s) => fund.sectorTilt.includes(s));
      const assetClassMatch = event.relatedAssetClasses.includes(fund.assetClass);
      const relevance = sectorMatch ? 1 : assetClassMatch ? 0.3 : 0;
      exposureScore += weight * relevance;
    }
    exposureScore *= event.magnitude;

    scoreByCategory.set(event.category, (scoreByCategory.get(event.category) ?? 0) + exposureScore);
    eventsByCategory.set(event.category, [...(eventsByCategory.get(event.category) ?? []), event]);
  }

  const totalScore = Array.from(scoreByCategory.values()).reduce((a, b) => a + b, 0);

  const factors: AttributionFactor[] = Array.from(scoreByCategory.entries())
    .map(([category, score]) => ({
      category,
      label: CATEGORY_LABEL[category],
      weightPct: totalScore === 0 ? 0 : Math.round((score / totalScore) * 1000) / 10,
      contributingEvents: (eventsByCategory.get(category) ?? []).sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => b.weightPct - a.weightPct);

  return factors;
}
