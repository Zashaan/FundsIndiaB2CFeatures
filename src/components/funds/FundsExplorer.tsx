import Link from "next/link";
import type { AssetClass, Fund, RiskLevel } from "@/lib/data/types";
import { getNavRangeForFund } from "@/lib/data/repository";

const ASSET_LABEL: Record<AssetClass, string> = {
  equity: "Equity",
  debt: "Debt",
  international: "International",
  liquid: "Liquid",
  gold: "Gold",
};

const RISK_STYLE: Record<RiskLevel, string> = {
  low: "bg-[#ecfff7] text-[#00a76f]",
  moderate: "bg-[#eef7ff] text-[#006bff]",
  high: "bg-amber-50 text-amber-700",
  "very high": "bg-rose-50 text-rose-600",
};

function rupee(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function riskLabel(risk: RiskLevel) {
  return risk
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function demoReturnPct(fund: Fund): number | undefined {
  const range = getNavRangeForFund(fund.id);
  if (!range || range.first.nav <= 0) return undefined;
  return ((range.last.nav - range.first.nav) / range.first.nav) * 100;
}

function fitCopy(fund: Fund) {
  if (fund.assetClass === "liquid") return "Good parking option for near-term needs and emergency liquidity.";
  if (fund.assetClass === "debt") return "Useful for stability inside a goal or lower-risk SIP bucket.";
  if (fund.assetClass === "gold") return "Adds hedge exposure without making the whole portfolio equity-heavy.";
  if (fund.assetClass === "international") return "Adds global diversification beyond domestic equity cycles.";
  if (fund.riskLevel === "very high") return "Consider only for long horizons and a smaller satellite allocation.";
  return "Core equity option for long-term growth-oriented goals.";
}

export function FundsExplorer({ funds }: { funds: Fund[] }) {
  const sortedFunds = [...funds].sort((a, b) => (demoReturnPct(b) ?? -Infinity) - (demoReturnPct(a) ?? -Infinity));
  const coreFunds = sortedFunds.filter((fund) => fund.riskLevel === "low" || fund.riskLevel === "moderate").slice(0, 3);
  const totalSip = 62000;

  return (
    <div className="fi-screen space-y-6 px-4 pb-28">
      <section className="fi-card rounded-[28px] border border-[#d8e7f5] bg-[linear-gradient(135deg,#ffffff_0%,#eef7ff_64%,#f3fff9_100%)] p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Mutual funds</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">Choose funds with context</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Compare funds by role, risk, cost, and fit before adding them to a SIP or goal.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            [funds.length.toString(), "Funds"],
            [rupee(totalSip), "Monthly SIP"],
            ["Moderate", "Profile"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/85 p-3 shadow-sm">
              <strong className="block text-base font-black text-slate-950">{value}</strong>
              <span className="text-[11px] font-semibold text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-4 gap-1">
          {["All", "Equity", "Debt", "Liquid"].map((label, index) => (
            <button
              key={label}
              type="button"
              className={`fi-pressable h-10 rounded-2xl text-xs font-bold ${index === 0 ? "bg-[#006bff] text-white" : "text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-[#caefe3] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">Advisor-approved starting set</p>
            <h2 className="mt-1 font-bold text-slate-950">Core funds to review first</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">Built for stability, liquidity, and long-term goal funding.</p>
          </div>
          <Link href="/advisor-calls" className="fi-pressable shrink-0 rounded-2xl bg-[#eef7ff] px-3 py-2 text-xs font-bold text-[#006bff]">
            Ask why
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {coreFunds.map((fund) => (
            <div key={fund.id} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-950">{fund.name}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{fund.category} · {fund.expenseRatio}% expense</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">All funds</h2>
          <span className="text-sm font-semibold text-slate-500">Sorted by demo return</span>
        </div>
        <div className="space-y-3">
          {sortedFunds.map((fund) => {
            const returnPct = demoReturnPct(fund);
            return (
              <article key={fund.id} className="fi-card rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">{ASSET_LABEL[fund.assetClass]}</p>
                    <h3 className="mt-1 font-bold leading-5 text-slate-950">{fund.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{fund.category} · {fund.expenseRatio}% expense ratio</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${RISK_STYLE[fund.riskLevel]}`}>
                    {riskLabel(fund.riskLevel)}
                  </span>
                </div>
                <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{fitCopy(fund)}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Return</p>
                    <p className={returnPct && returnPct >= 0 ? "text-sm font-black text-[#00a76f]" : "text-sm font-black text-rose-600"}>
                      {returnPct !== undefined ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">NAV start</p>
                    <p className="text-sm font-black text-slate-950">₹{fund.inceptionNav}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Use case</p>
                    <p className="text-sm font-black text-slate-950">{fund.assetClass === "equity" ? "Growth" : "Balance"}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" className="fi-pressable h-11 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
                    Add to compare
                  </button>
                  <button type="button" className="fi-pressable h-11 rounded-2xl bg-[linear-gradient(90deg,#00a76f,#006bff)] text-sm font-bold text-white">
                    Start SIP
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
