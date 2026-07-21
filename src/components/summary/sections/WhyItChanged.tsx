import type { AttributionFactor } from "@/lib/engines/attribution";
import type { PriorDipContext } from "@/lib/engines/priorDipContext";

export function WhyItChanged({
  factors,
  explanations,
  priorDipContext,
}: {
  factors: AttributionFactor[];
  explanations?: Record<string, string>;
  priorDipContext?: PriorDipContext | null;
}) {
  if (factors.length === 0 && !priorDipContext) return null;
  return (
    <ul className="space-y-3">
      {factors.map((f) => (
        <li key={f.category}>
          <p className="font-medium text-slate-800">
            About {f.weightPct}% of this week&apos;s change came from {f.label.toLowerCase()}.
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            {explanations?.[f.category] ?? f.contributingEvents[0]?.summary ?? ""}
          </p>
        </li>
      ))}
      {priorDipContext && (
        <li className="rounded-lg bg-slate-50 p-3">
          <p className="text-sm text-slate-700">
            Your portfolio saw a bigger dip than this on{" "}
            {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" }).format(
              new Date(priorDipContext.date)
            )}{" "}
            — it recovered within {priorDipContext.recoveredAfterPeriods} week
            {priorDipContext.recoveredAfterPeriods === 1 ? "" : "s"}.
          </p>
        </li>
      )}
    </ul>
  );
}
