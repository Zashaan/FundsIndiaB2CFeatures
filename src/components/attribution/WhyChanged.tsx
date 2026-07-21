import { Card, SectionHeading } from "@/components/ui/Card";
import { AttributionCard } from "./AttributionCard";
import type { AttributionFactor } from "@/lib/engines/attribution";

export function WhyChanged({
  factors,
  explanations,
}: {
  factors: AttributionFactor[];
  explanations?: Record<string, string>;
}) {
  if (factors.length === 0) return null;

  return (
    <Card>
      <SectionHeading
        title="Why Did My Portfolio Change?"
        subtitle="Estimated contribution of major market events."
      />
      <div className="space-y-2">
        {factors.map((f) => (
          <AttributionCard key={f.category} factor={f} explanation={explanations?.[f.category]} />
        ))}
      </div>
    </Card>
  );
}
