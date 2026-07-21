import { Card, SectionHeading } from "@/components/ui/Card";
import { MoverCard } from "./MoverCard";
import type { BriefingData } from "@/lib/engines/briefingData";

export function BiggestMovers({
  movers,
  reasons,
}: {
  movers: NonNullable<BriefingData["movers"]>;
  reasons?: Record<string, string>;
}) {
  if (movers.gainers.length === 0 && movers.decliners.length === 0) return null;

  return (
    <Card>
      <SectionHeading title="Your Biggest Movers" />
      {movers.gainers.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-700">Top Gainers</p>
          <div className="space-y-2">
            {movers.gainers.map((m) => (
              <MoverCard key={m.fundId} mover={m} reason={reasons?.[m.fundId]} />
            ))}
          </div>
        </div>
      )}
      {movers.decliners.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-rose-700">Biggest Declines</p>
          <div className="space-y-2">
            {movers.decliners.map((m) => (
              <MoverCard key={m.fundId} mover={m} reason={reasons?.[m.fundId]} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
