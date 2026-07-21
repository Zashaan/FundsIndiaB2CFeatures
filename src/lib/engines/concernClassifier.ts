import type { RiskLevel } from "@/lib/data/types";
import { getFundById } from "@/lib/data/repository";
import type { SnapshotDiff } from "./compareSnapshots";

export type ConcernLevel = "green" | "yellow" | "red";

export interface ConcernResult {
  level: ConcernLevel;
  reasonCode:
    | "within_normal_range"
    | "elevated_volatility"
    | "large_portfolio_swing"
    | "single_fund_drawdown";
  expectedStdevPct: number;
  actualPercentChange: number;
  worstHoldingPercentChange: number;
}

const RISK_SCORE: Record<RiskLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  "very high": 4,
};

const SINGLE_FUND_DRAWDOWN_THRESHOLD = -12; // percent, hard trigger regardless of overall portfolio move

function expectedStdevForRiskScore(weightedRiskScore: number): number {
  if (weightedRiskScore <= 1.5) return 1.5;
  if (weightedRiskScore <= 2.5) return 2.5;
  if (weightedRiskScore <= 3.5) return 4;
  return 6;
}

export function classifyConcern(diff: SnapshotDiff): ConcernResult {
  const totalValue = diff.totalValueBefore;
  const weightedRiskScore = diff.holdingDeltas.reduce((sum, h) => {
    const fund = getFundById(h.fundId);
    const weight = totalValue === 0 ? 0 : h.valueBefore / totalValue;
    return sum + weight * (fund ? RISK_SCORE[fund.riskLevel] : 2);
  }, 0);

  const expectedStdevPct = expectedStdevForRiskScore(weightedRiskScore);
  // Use the market-driven change, not the raw change — a SIP or lump-sum
  // contribution shouldn't itself register as portfolio "volatility".
  const actualPercentChange = diff.marketDrivenPercentChange;
  const worstHoldingPercentChange = Math.min(...diff.holdingDeltas.map((h) => h.percentChange), 0);

  if (worstHoldingPercentChange <= SINGLE_FUND_DRAWDOWN_THRESHOLD) {
    return {
      level: "red",
      reasonCode: "single_fund_drawdown",
      expectedStdevPct,
      actualPercentChange,
      worstHoldingPercentChange,
    };
  }

  const absChange = Math.abs(actualPercentChange);
  if (absChange > expectedStdevPct * 2) {
    return {
      level: "red",
      reasonCode: "large_portfolio_swing",
      expectedStdevPct,
      actualPercentChange,
      worstHoldingPercentChange,
    };
  }
  if (absChange > expectedStdevPct) {
    return {
      level: "yellow",
      reasonCode: "elevated_volatility",
      expectedStdevPct,
      actualPercentChange,
      worstHoldingPercentChange,
    };
  }
  return {
    level: "green",
    reasonCode: "within_normal_range",
    expectedStdevPct,
    actualPercentChange,
    worstHoldingPercentChange,
  };
}
