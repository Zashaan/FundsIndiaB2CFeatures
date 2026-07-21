import { Card, SectionHeading } from "@/components/ui/Card";
import type { ConcernResult } from "@/lib/engines/concernClassifier";

const LEVEL_META: Record<ConcernResult["level"], { emoji: string; label: string; bg: string }> = {
  green: { emoji: "🟢", label: "Everything looks normal.", bg: "bg-emerald-50" },
  yellow: { emoji: "🟡", label: "Slightly higher volatility.", bg: "bg-amber-50" },
  red: { emoji: "🔴", label: "Significant change detected.", bg: "bg-rose-50" },
};

const REASON_FALLBACK: Record<ConcernResult["reasonCode"], string> = {
  within_normal_range: "This movement is consistent with current market conditions.",
  elevated_volatility: "Your portfolio moved more than usual for its typical risk level.",
  large_portfolio_swing: "Your portfolio moved well outside its typical range this period.",
  single_fund_drawdown: "One of your funds declined substantially. You may wish to review it.",
};

export function ConcernBadge({ concern, narrative }: { concern: ConcernResult; narrative?: string }) {
  const meta = LEVEL_META[concern.level];
  return (
    <Card className={meta.bg}>
      <SectionHeading title="Should I Be Concerned?" />
      <p className="text-base font-medium text-slate-900">
        {meta.emoji} {meta.label}
      </p>
      <p className="mt-1 text-sm text-slate-600">{narrative ?? REASON_FALLBACK[concern.reasonCode]}</p>
    </Card>
  );
}
