"use client";

import { useEffect, useState } from "react";
import type { BriefingData } from "@/lib/engines/briefingData";
import type { BriefingResponse } from "@/lib/llm/schemas";
import { PortfolioHeader } from "@/components/header/PortfolioHeader";
import { BiggestMovers } from "@/components/movers/BiggestMovers";
import { WhyChanged } from "@/components/attribution/WhyChanged";
import { ExplainedSimply } from "@/components/jargon/ExplainedSimply";
import { AllocationDrift } from "@/components/allocation/AllocationDrift";
import { MarketEventsFeed } from "@/components/events/MarketEventsFeed";
import { AIInsights } from "@/components/insights/AIInsights";
import { ConcernBadge } from "@/components/concern/ConcernBadge";
import { OpportunitiesList } from "@/components/opportunities/OpportunitiesList";
import { AskAIChat } from "@/components/chat/AskAIChat";

function toRecord<T extends Record<string, unknown>>(items: T[] | undefined, key: keyof T, valueKey: keyof T) {
  if (!items) return undefined;
  return Object.fromEntries(items.map((i) => [i[key], i[valueKey]])) as Record<string, string>;
}

export function BriefingSections({
  data,
  params,
}: {
  data: BriefingData;
  params: { cursor?: string; from?: string; to?: string };
}) {
  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [loading, setLoading] = useState(!data.isFirstVisit);

  useEffect(() => {
    // Initial state already accounts for isFirstVisit (loading starts false), so just skip the fetch.
    if (data.isFirstVisit) return;

    let cancelled = false;
    // Resetting loading/briefing state when the snapshot pair changes, before
    // kicking off the refetch, is the standard React data-fetching pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setBriefing(null);
    fetch("/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setBriefing(json.data as BriefingResponse);
      })
      .catch((err) => console.error("Failed to load briefing", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.cursor, params.from, params.to, data.isFirstVisit]);

  const moversReasons = toRecord(briefing?.moversReasons, "fundId", "reason");
  const attributionExplanations = toRecord(briefing?.attributionExplanations, "category", "explanation");
  const opportunityNudges = toRecord(briefing?.opportunityNudges, "type", "nudge");

  return (
    <>
      <PortfolioHeader data={data} />

      {data.movers && <BiggestMovers movers={data.movers} reasons={moversReasons} />}
      {data.attribution.length > 0 && (
        <WhyChanged factors={data.attribution} explanations={attributionExplanations} />
      )}
      <ExplainedSimply terms={briefing?.jargonTerms} loading={loading} />
      {data.diff && (
        <AllocationDrift diff={data.diff} hadTransactionsInWindow={data.diff.hadTransactionsInWindow} />
      )}
      {data.relevantEvents.length > 0 && <MarketEventsFeed events={data.relevantEvents} />}
      {!data.isFirstVisit && <AIInsights summary={briefing?.insightsSummary} loading={loading} />}
      {data.concern && <ConcernBadge concern={data.concern} narrative={briefing?.concernNarrative} />}
      <OpportunitiesList opportunities={data.opportunities} nudges={opportunityNudges} />

      {!data.isFirstVisit && <AskAIChat data={data} params={params} />}
    </>
  );
}
