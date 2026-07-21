import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PercentChange, formatInr, formatInrSigned } from "@/components/ui/PercentChange";
import type { BriefingData } from "@/lib/engines/briefingData";

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" }).format(new Date(iso));
}

export function PortfolioHeader({ data }: { data: BriefingData }) {
  if (data.isFirstVisit || !data.diff) {
    return (
      <Card className="bg-slate-900 text-white">
        <p className="text-sm text-slate-300">Welcome, {data.user.name} 👋</p>
        <h1 className="mt-1 text-2xl font-semibold">This is your first visit</h1>
        <p className="mt-2 text-sm text-slate-300">
          Come back after your portfolio has had time to move, and we&apos;ll show you everything that
          changed.
        </p>
      </Card>
    );
  }

  const { diff } = data;
  // "Performance" describes investment returns, so it's driven by the
  // market-driven change — a SIP contribution alone shouldn't read as "positive performance".
  const isPositive = diff.marketDrivenPercentChange >= 0;
  const performanceLabel =
    diff.marketDrivenPercentChange === 0 ? "Flat" : isPositive ? "Positive" : "Negative";

  return (
    <Card className="bg-slate-900 text-white">
      <p className="text-sm text-slate-300">Welcome back, {data.user.name} 👋</p>
      <h1 className="mt-1 text-xl font-semibold">Here&apos;s what changed since your last visit.</h1>
      <p className="mt-1 text-sm text-slate-400">
        Since: {formatShortDate(data.fromDate)} &nbsp;·&nbsp; Today: {formatShortDate(data.toDate)}
      </p>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Portfolio Value</p>
          <p className="text-3xl font-semibold">{formatInr(diff.totalValueAfter)}</p>
          <p className="mt-1 text-sm">
            <span className={diff.absoluteChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {formatInrSigned(diff.absoluteChange)}
            </span>{" "}
            <PercentChange
              value={diff.percentChange}
              className={diff.absoluteChange >= 0 ? "!text-emerald-400" : "!text-rose-400"}
            />
          </p>
        </div>
        <Badge variant={diff.marketDrivenPercentChange === 0 ? "neutral" : isPositive ? "positive" : "negative"}>
          {performanceLabel}
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-sm">
        <span className="text-xs uppercase tracking-wide text-slate-400">Net Investment</span>
        <span className="font-medium">{formatInrSigned(diff.netInvestment)}</span>
      </div>
    </Card>
  );
}
