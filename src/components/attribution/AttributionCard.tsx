import { ExpandableCard } from "@/components/ui/ExpandableCard";
import type { AttributionFactor } from "@/lib/engines/attribution";

export function AttributionCard({ factor, explanation }: { factor: AttributionFactor; explanation?: string }) {
  return (
    <ExpandableCard
      header={
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-900">{factor.weightPct}%</span>
          <span className="text-sm text-slate-700">{factor.label}</span>
        </div>
      }
    >
      {explanation ? (
        <p>{explanation}</p>
      ) : (
        <ul className="list-inside list-disc space-y-1">
          {factor.contributingEvents.map((e) => (
            <li key={e.id}>{e.summary}</li>
          ))}
        </ul>
      )}
    </ExpandableCard>
  );
}
