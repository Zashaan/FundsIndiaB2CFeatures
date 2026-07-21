import type { BriefingData } from "@/lib/engines/briefingData";
import { getFundById } from "@/lib/data/repository";
import type { BriefingResponse } from "./schemas";
import { JARGON_GLOSSARY, selectJargonTerms } from "./jargonGlossary";

const CONCERN_NARRATIVE_FALLBACK: Record<string, string> = {
  within_normal_range: "Everything looks healthy — your portfolio is moving right in line with the market.",
  elevated_volatility:
    "A little more movement than usual, which is completely normal for a diversified portfolio. Staying invested keeps you on track.",
  large_portfolio_swing:
    "This period's swing was bigger than your portfolio typically sees — worth noting, though it's still a short-term market move, not a problem with your funds. Long-term investors usually ride these out.",
  single_fund_drawdown:
    "One fund pulled back more sharply than usual after a strong run — a bigger move than a typical dip, but still a normal part of investing, and often a chance to keep building your position.",
};

/**
 * Fully deterministic stand-in for the LLM-generated briefing, built only
 * from already-computed engine facts. Used when ANTHROPIC_API_KEY is unset
 * or the Claude call fails, so the app never breaks — it just reads more
 * plainly.
 */
export function buildFallbackBriefing(data: BriefingData): BriefingResponse {
  const allContributingEvents = data.attribution.flatMap((f) => f.contributingEvents);
  const moversReasons = [...(data.movers?.gainers ?? []), ...(data.movers?.decliners ?? [])].map((m) => {
    const fund = getFundById(m.fundId);
    const expectedSentiment = m.percentChange >= 0 ? "positive" : "negative";
    const isRelevant = (e: (typeof allContributingEvents)[number]) =>
      !!fund &&
      (e.relatedSectors.some((s) => fund.sectorTilt.includes(s)) || e.relatedAssetClasses.includes(fund.assetClass));

    const relatedEvent =
      allContributingEvents.find((e) => isRelevant(e) && e.sentiment === expectedSentiment) ??
      allContributingEvents.find((e) => isRelevant(e));

    return {
      fundId: m.fundId,
      reason: relatedEvent
        ? relatedEvent.summary
        : `Reflects overall fund performance during this period (${m.percentChange > 0 ? "+" : ""}${m.percentChange}%).`,
    };
  });

  const attributionExplanations = data.attribution.map((f) => ({
    category: f.category,
    explanation:
      f.contributingEvents[0]?.summary ??
      `${f.label} contributed an estimated ${f.weightPct}% of the movement in your portfolio this period.`,
  }));

  const jargonTerms = selectJargonTerms(data).map((term) => ({
    term,
    explanation: JARGON_GLOSSARY[term],
  }));

  const up = data.diff ? data.diff.marketDrivenPercentChange >= 0 : true;

  const shortSummary = data.diff
    ? up
      ? `Good news — your portfolio grew ${Math.abs(data.diff.marketDrivenPercentChange)}% this week.`
      : `A normal, small dip this week — nothing unusual for your mix.`
    : "Welcome! Check back once your portfolio has had time to move.";

  const insightsSummary: string[] = data.diff
    ? [
        up
          ? `Your investments grew ${Math.abs(data.diff.marketDrivenPercentChange)}% from market movement this week.`
          : `The wider market dipped ${Math.abs(data.diff.marketDrivenPercentChange)}% this week — a normal short-term move.`,
        ...(data.movers?.gainers[0]
          ? [`${data.movers.gainers[0].fundName} led the way as your strongest performer.`]
          : []),
        "Staying invested keeps your money working for you.",
      ]
    : ["Welcome! Once your portfolio has had time to move, we'll show you everything that's going well."];

  const opportunityNudges = data.opportunities.map((o) => ({
    type: o.type,
    nudge: o.fact,
  }));

  const concernNarrative = data.concern ? CONCERN_NARRATIVE_FALLBACK[data.concern.reasonCode] : "";

  return {
    moversReasons,
    attributionExplanations,
    jargonTerms,
    shortSummary,
    insightsSummary,
    opportunityNudges,
    concernNarrative,
  };
}
