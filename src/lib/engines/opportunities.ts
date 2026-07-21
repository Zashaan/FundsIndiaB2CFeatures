import type { PortfolioSnapshot } from "@/lib/data/types";
import { getAllTransactions, getFundById, getNavOnOrBefore } from "@/lib/data/repository";

export interface Opportunity {
  type: "idle_cash" | "low_international_diversification" | "concentration_risk" | "sip_consistency";
  fact: string;
  severity: "info" | "suggestion";
}

const CONCENTRATION_THRESHOLD_PCT = 35;
const LOW_INTERNATIONAL_THRESHOLD_PCT = 8;
const SIP_CONSISTENCY_MIN_COUNT = 3;

/**
 * Deterministic, factual observations only — every string here is a fact
 * the LLM layer can safely turn into educational prose without inventing
 * anything.
 */
export function detectOpportunities(snapshot: PortfolioSnapshot): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const allTransactions = getAllTransactions();

  const liquidHolding = snapshot.holdings.find((h) => getFundById(h.fundId)?.assetClass === "liquid");
  if (liquidHolding) {
    const liquidTxnCount = allTransactions.filter((t) => t.fundId === liquidHolding.fundId).length;
    const liquidAllocationPct = snapshot.allocation.liquid ?? 0;
    if (liquidTxnCount === 0 && liquidAllocationPct >= 5) {
      opportunities.push({
        type: "idle_cash",
        fact: `Your liquid fund balance (${liquidAllocationPct}% of your portfolio) has had no transactions across the entire period on record.`,
        severity: "suggestion",
      });
    }
  }

  const internationalAllocationPct = snapshot.allocation.international ?? 0;
  if (internationalAllocationPct < LOW_INTERNATIONAL_THRESHOLD_PCT) {
    opportunities.push({
      type: "low_international_diversification",
      fact: `Only ${internationalAllocationPct}% of your portfolio is in international funds.`,
      severity: "info",
    });
  }

  const holdingValues = snapshot.holdings.map((h) => {
    const nav = getNavOnOrBefore(h.fundId, snapshot.date) ?? 0;
    return { fundId: h.fundId, value: h.units * nav };
  });
  const mostConcentrated = holdingValues.reduce(
    (max, h) => (h.value > max.value ? h : max),
    holdingValues[0]
  );
  const mostConcentratedSharePct =
    snapshot.totalValue === 0 ? 0 : Math.round((mostConcentrated.value / snapshot.totalValue) * 1000) / 10;
  if (mostConcentratedSharePct >= CONCENTRATION_THRESHOLD_PCT) {
    const fund = getFundById(mostConcentrated.fundId);
    opportunities.push({
      type: "concentration_risk",
      fact: `${fund?.name ?? mostConcentrated.fundId} makes up ${mostConcentratedSharePct}% of your total portfolio value.`,
      severity: "suggestion",
    });
  }

  const sipTxnCount = allTransactions.filter((t) => t.type === "sip").length;
  if (sipTxnCount >= SIP_CONSISTENCY_MIN_COUNT) {
    opportunities.push({
      type: "sip_consistency",
      fact: `You've kept ${sipTxnCount} SIP installments running on schedule across the period on record.`,
      severity: "info",
    });
  }

  return opportunities;
}
