import type { FromToSnapshots } from "@/lib/session/cursor";
import { getSnapshotCount } from "@/lib/session/cursor";
import { getUser } from "@/lib/data/repository";
import { compareSnapshots, getBiggestMovers, type SnapshotDiff } from "./compareSnapshots";
import { filterRelevantEvents } from "./relevantEvents";
import { computeAttribution, type AttributionFactor } from "./attribution";
import { classifyConcern, type ConcernResult } from "./concernClassifier";
import { detectOpportunities, type Opportunity } from "./opportunities";
import { computeHistoricalGrowth, type HistoricalGrowthPoint } from "./historicalGrowth";
import { findLargerPriorDip, type PriorDipContext } from "./priorDipContext";
import { getSnapshots } from "@/lib/data/repository";
import type { MacroEvent } from "@/lib/data/types";

export interface BriefingData {
  isFirstVisit: boolean;
  cursorIndex: number;
  snapshotCount: number;
  user: { id: string; name: string };
  fromDate: string;
  toDate: string;
  diff: SnapshotDiff | null;
  movers: { gainers: SnapshotDiff["holdingDeltas"]; decliners: SnapshotDiff["holdingDeltas"] } | null;
  relevantEvents: MacroEvent[];
  attribution: AttributionFactor[];
  concern: ConcernResult | null;
  opportunities: Opportunity[];
  historicalGrowth: HistoricalGrowthPoint[];
  priorDipContext: PriorDipContext | null;
}

export function computeBriefingData(pair: FromToSnapshots): BriefingData {
  const user = getUser();
  const snapshotCount = getSnapshotCount();

  if (pair.isFirstVisit) {
    return {
      isFirstVisit: true,
      cursorIndex: pair.cursorIndex,
      snapshotCount,
      user: { id: user.id, name: user.name },
      fromDate: pair.from.date,
      toDate: pair.to.date,
      diff: null,
      movers: null,
      relevantEvents: [],
      attribution: [],
      concern: null,
      opportunities: detectOpportunities(pair.to),
      historicalGrowth: [],
      priorDipContext: null,
    };
  }

  const diff = compareSnapshots(pair.from, pair.to);
  const movers = getBiggestMovers(diff, 4);
  const relevantEvents = filterRelevantEvents(pair.to.holdings, pair.from.date, pair.to.date);
  const attribution = computeAttribution(pair.to.holdings, diff.totalValueAfter, relevantEvents, pair.to.date);
  const concern = classifyConcern(diff);
  const opportunities = detectOpportunities(pair.to);
  const historicalGrowth = computeHistoricalGrowth(pair.to.holdings, pair.to.date, diff.totalValueAfter, [1, 3, 5]);
  const priorDipContext =
    diff.marketDrivenPercentChange < 0
      ? findLargerPriorDip(getSnapshots(), pair.cursorIndex, -diff.marketDrivenPercentChange)
      : null;

  return {
    isFirstVisit: false,
    cursorIndex: pair.cursorIndex,
    snapshotCount,
    user: { id: user.id, name: user.name },
    fromDate: pair.from.date,
    toDate: pair.to.date,
    diff,
    movers,
    relevantEvents,
    attribution,
    concern,
    opportunities,
    historicalGrowth,
    priorDipContext,
  };
}
