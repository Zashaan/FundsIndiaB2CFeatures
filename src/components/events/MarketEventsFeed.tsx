import { Card, SectionHeading } from "@/components/ui/Card";
import type { MacroEvent } from "@/lib/data/types";

const CATEGORY_ICON: Record<MacroEvent["category"], string> = {
  market_correction: "📉",
  sector_movement: "🏭",
  rate_expectations: "🏦",
  global_markets: "🌍",
  currency: "💱",
};

const SENTIMENT_MARK: Record<MacroEvent["sentiment"], string> = {
  positive: "✓",
  negative: "!",
  neutral: "•",
};

export function MarketEventsFeed({ events }: { events: MacroEvent[] }) {
  if (events.length === 0) return null;

  return (
    <Card>
      <SectionHeading
        title="Market Events That Affected You"
        subtitle="Only events relevant to what you actually hold."
      />
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="flex items-start gap-3 text-sm">
            <span className="text-lg leading-none">{CATEGORY_ICON[event.category]}</span>
            <div>
              <p className="font-medium text-slate-800">
                {SENTIMENT_MARK[event.sentiment]} {event.headline}
              </p>
              <p className="text-xs text-slate-400">
                {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
                  new Date(event.date)
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
