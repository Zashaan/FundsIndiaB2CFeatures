"use client";

import { useEffect, useState } from "react";
import type { BriefingData } from "@/lib/engines/briefingData";
import type { BriefingResponse } from "@/lib/llm/schemas";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatInr, formatInrSigned, PercentChange } from "@/components/ui/PercentChange";
import { SummarySection } from "./sections/SummarySection";
import { BestInvestments } from "./sections/BestInvestments";
import { SinceYouInvested } from "./sections/SinceYouInvested";
import { WhatChangedTable } from "./sections/WhatChangedTable";
import { WhyItChanged } from "./sections/WhyItChanged";

function toRecord<T extends Record<string, unknown>>(items: T[] | undefined, key: keyof T, valueKey: keyof T) {
  if (!items) return undefined;
  return Object.fromEntries(items.map((i) => [i[key], i[valueKey]])) as Record<string, string>;
}

export function SummaryBody({ from, to }: { from: string; to: string }) {
  const [data, setData] = useState<BriefingData | null>(null);
  const [prose, setProse] = useState<BriefingResponse | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Resetting data/prose/error when the snapshot pair changes, before
    // kicking off the refetch, is the standard React data-fetching pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null);
    setProse(null);
    setLoadError(false);
    const q = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    fetch(`/api/snapshot-diff?${q}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.success) setData(j.data as BriefingData);
        else setLoadError(true);
      })
      .catch(() => !cancelled && setLoadError(true));
    fetch(`/api/briefing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    })
      .then((r) => r.json())
      .then((j) => !cancelled && j.success && setProse(j.data as BriefingResponse))
      .catch(() => {}); // Prose is optional polish — its own sections fall back to a skeleton, not an error.
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  if (loadError) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Couldn&apos;t load this summary right now. Please try again in a moment.
      </div>
    );
  }

  if (!data || !data.diff) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const { diff } = data;
  const firstName = data.user.name.split(" ")[0];
  const up = diff.marketDrivenPercentChange >= 0;
  const moverReasons = toRecord(prose?.moversReasons, "fundId", "reason");
  const attrExpl = toRecord(prose?.attributionExplanations, "category", "explanation");

  return (
    <div className="space-y-3">
      {/* 1. Summary */}
      <div className="rounded-2xl bg-emerald-600 p-4 text-white">
        <p className="text-sm text-emerald-50">Hey {firstName}, welcome back 👋</p>
        <p className="mt-2 text-sm text-white">
          {prose?.shortSummary ?? (up ? "Your investments moved up this week." : "A steady week for your portfolio.")}
        </p>
        <p className="mt-3 text-2xl font-semibold">{formatInr(diff.totalValueAfter)}</p>
        <p className="mt-1 text-sm">
          <span className="text-emerald-50">{formatInrSigned(diff.absoluteChange)}</span>{" "}
          <PercentChange value={diff.percentChange} className="!text-white" />
        </p>
      </div>

      {/* 2. Best investments */}
      {data.movers && data.movers.gainers.length > 0 && (
        <SummarySection title="Best Investments This Week" hook="Your top performers this period" defaultOpen>
          <BestInvestments gainers={data.movers.gainers} reasons={moverReasons} />
        </SummarySection>
      )}

      {/* 3. Since You Invested */}
      {data.historicalGrowth.length > 0 && (
        <SummarySection title="Since You Invested" hook="The bigger picture" defaultOpen>
          <SinceYouInvested points={data.historicalGrowth} />
        </SummarySection>
      )}

      {/* 4. The Full Story */}
      <SummarySection title="The Full Story" hook="What happened, in short">
        {prose?.insightsSummary ? (
          <ul className="list-disc space-y-1 pl-4">
            {prose.insightsSummary.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
      </SummarySection>

      {/* 5. What Changed */}
      <SummarySection title="What Changed" hook="Your allocation, before and now">
        <WhatChangedTable diff={diff} />
      </SummarySection>

      {/* 6. Why It Changed */}
      <SummarySection title="Why It Changed" hook="The market forces behind the move">
        <WhyItChanged factors={data.attribution} explanations={attrExpl} priorDipContext={data.priorDipContext} />
      </SummarySection>
    </div>
  );
}
