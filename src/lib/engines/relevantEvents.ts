import type { Holding, MacroEvent } from "@/lib/data/types";
import { getEventsInRange, getFundById } from "@/lib/data/repository";

/** Only surface events that touch a sector or asset class the user actually holds. */
export function filterRelevantEvents(
  holdings: Holding[],
  fromDateExclusive: string,
  toDateInclusive: string
): MacroEvent[] {
  const heldFunds = holdings.map((h) => getFundById(h.fundId)).filter(Boolean) as ReturnType<
    typeof getFundById
  >[];
  const heldSectors = new Set(heldFunds.flatMap((f) => f!.sectorTilt));
  const heldAssetClasses = new Set(heldFunds.map((f) => f!.assetClass));

  const events = getEventsInRange(fromDateExclusive, toDateInclusive);
  return events
    .filter(
      (event) =>
        event.relatedSectors.some((s) => heldSectors.has(s)) ||
        event.relatedAssetClasses.some((ac) => heldAssetClasses.has(ac))
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}
