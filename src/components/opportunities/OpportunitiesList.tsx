import { Card, SectionHeading } from "@/components/ui/Card";
import type { Opportunity } from "@/lib/engines/opportunities";

export function OpportunitiesList({
  opportunities,
  nudges,
}: {
  opportunities: Opportunity[];
  nudges?: Record<string, string>;
}) {
  if (opportunities.length === 0) return null;

  return (
    <Card className="bg-sky-50/60">
      <SectionHeading
        title="Opportunities You May Have Missed"
        subtitle="Educational only — not a recommendation to act."
      />
      <div className="space-y-2">
        {opportunities.map((o) => (
          <div key={o.type} className="rounded-lg bg-white p-3 text-sm text-slate-600">
            {nudges?.[o.type] ?? o.fact}
          </div>
        ))}
      </div>
    </Card>
  );
}
