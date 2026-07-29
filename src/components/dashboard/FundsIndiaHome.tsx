import Link from "next/link";
import type { AssetClass, Fund } from "@/lib/data/types";
import { getNavRangeForFund, getSnapshots } from "@/lib/data/repository";

const ASSET_LABEL: Record<AssetClass, string> = {
  equity: "Equity",
  debt: "Debt",
  international: "International",
  liquid: "Liquid",
  gold: "Gold",
};

const ASSET_COLOR: Record<AssetClass, string> = {
  equity: "bg-[#006bff]",
  debt: "bg-[#00a76f]",
  international: "bg-[#7c3aed]",
  liquid: "bg-[#0f766e]",
  gold: "bg-[#d97706]",
};

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x2c1b3c6d);
  hash ^= hash >>> 12;
  hash = Math.imul(hash, 0x297a2d39);
  hash ^= hash >>> 15;
  return hash >>> 0;
}

function investorCountLabel(fund: Fund): string {
  const hash = hashString(fund.id);
  const thousands = 20 + (hash % 701) / 10;
  return `${thousands.toFixed(1)}K investors`;
}

function starRating(fund: Fund): number {
  const hash = hashString(fund.id + fund.riskLevel);
  return 4 + (hash % 2);
}

function demoReturnPct(fund: Fund): number | undefined {
  const range = getNavRangeForFund(fund.id);
  if (!range || range.first.nav <= 0) return undefined;
  return ((range.last.nav - range.first.nav) / range.first.nav) * 100;
}

function rupee(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function riskLabel(fund: Fund) {
  return fund.riskLevel
    .split(" ")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function FundsIndiaHome({ funds }: { funds: Fund[] }) {
  const snapshots = getSnapshots();
  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[Math.max(0, snapshots.length - 2)];
  const change = latest.totalValue - previous.totalValue;
  const changePct = previous.totalValue > 0 ? (change / previous.totalValue) * 100 : 0;
  const recommended = [...funds]
    .sort((a, b) => (demoReturnPct(b) ?? -Infinity) - (demoReturnPct(a) ?? -Infinity))
    .slice(0, 3);
  const sipReady = funds.filter((fund) => fund.riskLevel === "low" || fund.riskLevel === "moderate").slice(0, 2);

  return (
    <div className="fi-screen space-y-6 px-4 pb-28">
      <section className="fi-card overflow-hidden rounded-[28px] bg-[#0b1220] p-5 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-bold uppercase tracking-normal text-[#7dd3fc]">Home</p>
        <h1 className="mt-2 text-3xl font-black leading-tight">Portfolio confidence</h1>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-black leading-tight">{rupee(latest.totalValue)}</p>
            <p className="mt-1 text-sm text-slate-300">Total mutual fund portfolio value</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${change >= 0 ? "bg-[#123c37] text-[#7cf8cf]" : "bg-rose-950 text-rose-200"}`}>
            {change >= 0 ? "+" : ""}
            {changePct.toFixed(2)}%
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["92", "Confidence score"],
            ["7", "Funds held"],
            ["₹62K", "Monthly SIP"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <strong className="block text-lg font-black text-white">{value}</strong>
              <span className="text-[11px] font-semibold leading-4 text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link href="/goals" className="fi-card fi-pressable rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">GL</span>
          <h2 className="mt-4 font-bold text-slate-950">Goals on track</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">2 active plans, 1 needs attention.</p>
        </Link>
        <Link href="/advisor-calls" className="fi-card fi-pressable rounded-3xl border border-[#d8e7f5] bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5ff] text-xs font-black text-[#0f4c81]">RN</span>
          <h2 className="mt-4 font-bold text-slate-950">Advisor ready</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">Rekha can review your next move.</p>
        </Link>
      </section>

      <section className="fi-card rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Allocation guardrail</p>
            <h2 className="mt-1 font-bold text-slate-950">Diversified, slightly equity-led</h2>
          </div>
          <span className="rounded-full bg-[#ecfff7] px-3 py-1 text-xs font-bold text-[#00a76f]">Healthy</span>
        </div>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
          {(Object.entries(latest.allocation) as [AssetClass, number][]).map(([assetClass, percent]) => (
            <div key={assetClass} className={`${ASSET_COLOR[assetClass]} h-full`} style={{ width: `${percent}%` }} title={`${ASSET_LABEL[assetClass]} ${percent}%`} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {(Object.entries(latest.allocation) as [AssetClass, number][]).map(([assetClass, percent]) => (
            <div key={assetClass} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full ${ASSET_COLOR[assetClass]}`} />
              <span>{ASSET_LABEL[assetClass]}</span>
              <span className="ml-auto text-slate-900">{percent}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-950">Next best actions</h2>
          <span className="text-xs font-bold text-slate-500">This week</span>
        </div>
        <div className="space-y-3">
          {[
            ["Review home goal shortfall", "Projection is behind target by about ₹6.4L.", "/goals"],
            ["Keep SIPs unchanged", "Current SIP behavior supports long-term plans.", "/summary"],
            ["Discuss surplus allocation", "Ask Rekha before deploying new cash.", "/advisor-calls"],
          ].map(([title, copy, href]) => (
            <Link key={title} href={href} className="fi-pressable block rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-[#d8e7f5] bg-[linear-gradient(135deg,#ffffff,#f3f8ff)] p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] text-xs font-black text-[#006bff]">
            AI
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">Ask before acting</p>
            <h2 className="mt-1 font-bold text-slate-950">Get matched to trusted guidance</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Ask a money question. FundsIndia checks existing expert answers first, then suggests an advisor call if the question needs context.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-white p-3">
          <p className="text-sm font-bold text-slate-950">“Should I increase SIP after my raise?”</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Matched to SIP guidance, goal impact, and an optional call with Rekha.
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link href="/summary" className="fi-pressable flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
            See answers
          </Link>
          <Link href="/advisor-calls" className="fi-pressable flex h-11 items-center justify-center rounded-2xl bg-[#006bff] text-sm font-bold text-white">
            Ask Rekha
          </Link>
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-[#caefe3] bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-normal text-[#00a76f]">Income-aware SIP</p>
        <h2 className="mt-1 font-bold text-slate-950">Salary update could move goals faster</h2>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          If monthly surplus rose by ₹18K, increasing SIP by ₹9K could bring the education goal forward by 11 months.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#ecfff7] p-3">
            <p className="text-[11px] font-bold uppercase tracking-normal text-[#00a76f]">Current SIP</p>
            <p className="mt-1 text-lg font-black text-slate-950">₹62K</p>
          </div>
          <div className="rounded-2xl bg-[#eef7ff] p-3">
            <p className="text-[11px] font-bold uppercase tracking-normal text-[#006bff]">Suggested</p>
            <p className="mt-1 text-lg font-black text-slate-950">₹71K</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Funds worth reviewing</h2>
          <Link href="/funds" className="fi-pressable rounded-xl px-2 py-1 text-sm font-bold text-[#006bff]">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recommended.map((fund) => {
            const returnPct = demoReturnPct(fund);
            return (
              <Link key={fund.id} href="/funds" className="fi-card fi-pressable block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">{fund.category}</p>
                    <h3 className="mt-1 font-bold leading-5 text-slate-950">{fund.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {riskLabel(fund)} risk · {fund.expenseRatio}% expense · {investorCountLabel(fund)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
                    {"★".repeat(starRating(fund))}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Demo return window</span>
                  <strong className={returnPct && returnPct >= 0 ? "text-sm text-[#00a76f]" : "text-sm text-rose-600"}>
                    {returnPct !== undefined ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%` : "N/A"}
                  </strong>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="fi-card rounded-3xl border border-[#d8e7f5] bg-[linear-gradient(135deg,#ffffff,#f3f8ff)] p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-normal text-[#006bff]">SIP watchlist</p>
        <h2 className="mt-1 font-bold text-slate-950">Lower-volatility funds for planned investing</h2>
        <div className="mt-3 grid gap-2">
          {sipReady.map((fund) => (
            <div key={fund.id} className="rounded-2xl bg-white p-3">
              <p className="text-sm font-bold text-slate-950">{fund.name}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{fund.category} · {riskLabel(fund)} risk</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
