"use client";

import Link from "next/link";
import { useState } from "react";
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

type AssetFilter = "all" | AssetClass;
type RiskFilter = "all" | RiskLevel;

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

function goalFit(fund: Fund) {
  if (fund.assetClass === "liquid") return "Emergency reserve";
  if (fund.assetClass === "debt") return "Home down payment";
  if (fund.assetClass === "gold") return "Portfolio hedge";
  if (fund.assetClass === "international") return "Long-term wealth";
  if (fund.riskLevel === "very high") return "Small satellite";
  return "Education goal";
}

function whyThisFund(fund: Fund) {
  const returnPct = demoReturnPct(fund);
  const returnText = returnPct === undefined ? "has limited demo history" : `is ${returnPct >= 0 ? "up" : "down"} ${Math.abs(returnPct).toFixed(1)}% in the demo window`;
  return `${fund.name} ${returnText}, carries ${riskLabel(fund.riskLevel).toLowerCase()} risk, and costs ${fund.expenseRatio}% annually.`;
}

export function FundsExplorer({ funds }: { funds: Fund[] }) {
  const sortedFunds = [...funds].sort((a, b) => (demoReturnPct(b) ?? -Infinity) - (demoReturnPct(a) ?? -Infinity));
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [compareIds, setCompareIds] = useState<string[]>(sortedFunds.slice(0, 2).map((fund) => fund.id));
  const coreFunds = sortedFunds.filter((fund) => fund.riskLevel === "low" || fund.riskLevel === "moderate").slice(0, 3);
  const filteredFunds = sortedFunds.filter((fund) => {
    const assetMatches = assetFilter === "all" || fund.assetClass === assetFilter;
    const riskMatches = riskFilter === "all" || fund.riskLevel === riskFilter;
    return assetMatches && riskMatches;
  });
  const compareFunds = compareIds.map((id) => funds.find((fund) => fund.id === id)).filter((fund): fund is Fund => Boolean(fund));
  const totalSip = 62000;

  const toggleCompare = (fundId: string) => {
    setCompareIds((current) => {
      if (current.includes(fundId)) return current.filter((id) => id !== fundId);
      return [fundId, ...current].slice(0, 3);
    });
  };

  return (
    <div className="fi-screen space-y-6 px-4 pb-28">
      <section className="fi-card rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#7c3aed]">Research desk</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">Choose funds with context</h1>
          </div>
          <span className="rounded-2xl bg-[#f5f3ff] px-3 py-2 text-xs font-black text-[#7c3aed]">MF</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Compare funds by role, risk, cost, and fit before adding them to a SIP or goal.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
          {[
            [funds.length.toString(), "Funds"],
            [rupee(totalSip), "Monthly SIP"],
            ["Moderate", "Profile"],
          ].map(([value, label]) => (
            <div key={label} className="bg-slate-50 p-3">
              <strong className="block text-base font-black text-slate-950">{value}</strong>
              <span className="text-[11px] font-semibold text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        <p className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-normal text-[#7c3aed]">Filter by role</p>
        <div className="grid grid-cols-4 gap-1">
          {[
            ["all", "All"],
            ["equity", "Equity"],
            ["debt", "Debt"],
            ["liquid", "Liquid"],
          ].map(([value, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => setAssetFilter(value as AssetFilter)}
              className={`fi-pressable h-10 rounded-2xl text-xs font-bold ${assetFilter === value ? "bg-[#006bff] text-white" : "text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[
            ["all", "Any risk"],
            ["low", "Low"],
            ["moderate", "Moderate"],
            ["high", "High"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRiskFilter(value as RiskFilter)}
              className={`fi-pressable min-h-10 rounded-2xl px-1 text-[11px] font-bold ${riskFilter === value ? "bg-[#7c3aed] text-white" : "text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-[#d8e7f5] bg-[linear-gradient(135deg,#ffffff,#f3f8ff)] p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-xs font-black text-[#006bff]">
            RN
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Rekha&apos;s research lens</p>
            <h2 className="mt-1 font-bold text-slate-950">Shortlist funds by the job they do</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Funds are framed as goal tools: core growth, stability, liquidity, or satellite exposure.
            </p>
          </div>
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#7c3aed]">Comparison</p>
            <h2 className="mt-1 font-bold text-slate-950">Side-by-side shortlist</h2>
          </div>
          <span className="rounded-full bg-[#f5f3ff] px-3 py-1 text-xs font-bold text-[#7c3aed]">{compareFunds.length}/3</span>
        </div>
        <div className="grid gap-2">
          {compareFunds.map((fund) => {
            const returnPct = demoReturnPct(fund);
            return (
              <div key={fund.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-2xl bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">{fund.name}</p>
                  <p className="text-xs font-semibold text-slate-500">{goalFit(fund)} · {riskLabel(fund.riskLevel)}</p>
                </div>
                <strong className={returnPct && returnPct >= 0 ? "text-sm text-[#00a76f]" : "text-sm text-rose-600"}>
                  {returnPct !== undefined ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%` : "N/A"}
                </strong>
                <button
                  type="button"
                  onClick={() => toggleCompare(fund.id)}
                  aria-label={`Remove ${fund.name} from comparison`}
                  className="fi-pressable h-8 w-8 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        <Link href="/advisor-calls" className="fi-pressable mt-4 flex h-11 items-center justify-center rounded-2xl bg-[#7c3aed] text-sm font-bold text-white">
          Review shortlist with Rekha
        </Link>
      </section>

      <section className="fi-card rounded-3xl border border-[#e4ddff] bg-[#fbfaff] p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#7c3aed]">Advisor-reviewed shortlist</p>
            <h2 className="mt-1 font-bold text-slate-950">Core funds to review first</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">Built for stability, liquidity, and long-term goal funding.</p>
          </div>
          <Link href="/advisor-calls" className="fi-pressable shrink-0 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-[#7c3aed]">
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

      <section className="fi-card rounded-3xl border border-[#d8e7f5] bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">
            TR
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Transfer-in concierge</p>
            <h2 className="mt-1 font-bold text-slate-950">Bring external mutual funds into one view</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Prototype for broker change, online conversion, reconciliation, e-sign, OTP, and cooling-period tracking in one guided flow.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["E-sign", "OTP check", "15-day track"].map((step) => (
            <div key={step} className="rounded-2xl bg-slate-50 p-3 text-center text-xs font-bold text-slate-600">
              {step}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">All funds</h2>
          <span className="text-sm font-semibold text-slate-500">{filteredFunds.length} shown</span>
        </div>
        <div className="space-y-3">
          {filteredFunds.map((fund) => {
            const returnPct = demoReturnPct(fund);
            const selected = compareIds.includes(fund.id);
            return (
              <article key={fund.id} className="fi-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-normal text-[#7c3aed]">{ASSET_LABEL[fund.assetClass]}</p>
                    <h3 className="mt-1 font-bold leading-5 text-slate-950">{fund.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{fund.category} · {fund.expenseRatio}% expense ratio</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${RISK_STYLE[fund.riskLevel]}`}>
                    {riskLabel(fund.riskLevel)}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  <p className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{fitCopy(fund)}</p>
                  <p className="rounded-2xl bg-[#f8fafc] p-3 text-xs leading-5 text-slate-600">
                    <strong className="text-slate-900">Why this fund: </strong>{whyThisFund(fund)}
                  </p>
                </div>
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
                    <p className="text-[11px] font-semibold text-slate-500">Goal fit</p>
                    <p className="text-sm font-black text-slate-950">{goalFit(fund)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCompare(fund.id)}
                    className={`fi-pressable h-11 rounded-2xl border text-sm font-bold ${
                      selected ? "border-[#7c3aed] bg-[#f5f3ff] text-[#7c3aed]" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {selected ? "Comparing" : "Add to compare"}
                  </button>
                  <button type="button" className="fi-pressable h-11 rounded-2xl bg-[#7c3aed] text-sm font-bold text-white">
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
