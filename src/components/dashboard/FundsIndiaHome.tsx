import type { Fund } from "@/lib/data/types";
import { getNavRangeForFund } from "@/lib/data/repository";

const PRODUCTS = [
  { label: "Mutual Funds", icon: "₹" },
  { label: "Stocks", icon: "📈" },
];

/** Deterministic (no Math.random()) string hash with an avalanche finalizer
 * (FNV-1a + a murmur3-style bit mix), so a given fund always shows the same
 * synthesized investor count / rating. The finalizer matters here: this
 * app's fund ids are sequential ("FI-001".."FI-007"), and a plain polynomial
 * hash without one leaves near-identical inputs producing near-identical
 * outputs — every fund would cluster in the same narrow band. */
function hashString(input: string): number {
  let hash = 2166136261; // FNV-1a offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x2c1b3c6d);
  hash ^= hash >>> 12;
  hash = Math.imul(hash, 0x297a2d39);
  hash ^= hash >>> 15;
  return hash >>> 0;
}

/** Deterministic pseudo investor count in the 20K-90K range, formatted like "62.4K INVESTORS". */
function investorCountLabel(fund: Fund): string {
  const hash = hashString(fund.id);
  const thousands = 20 + (hash % 701) / 10; // 20.0 - 90.0
  return `${thousands.toFixed(1)}K INVESTORS`;
}

/** Deterministic 4-or-5 star rating derived from the fund's risk level + id. */
function starRating(fund: Fund): number {
  const hash = hashString(fund.id + fund.riskLevel);
  return 4 + (hash % 2); // 4 or 5
}

/** "Since inception (demo)" return: earliest vs. latest NAV in the seeded
 * history window for this fund. Explicitly labeled as a demo figure so it
 * doesn't imply a real 3-year return — see plan Task 18 visual spec. */
function demoReturnPct(fund: Fund): number | undefined {
  const range = getNavRangeForFund(fund.id);
  if (!range) return undefined;
  const { first, last } = range;
  if (first.nav <= 0) return undefined;
  return ((last.nav - first.nav) / first.nav) * 100;
}

export function FundsIndiaHome({ funds }: { funds: Fund[] }) {
  // Lead with what's actually performing well — a real recommendation module
  // wouldn't feature a fund that's currently down. Rank across all funds
  // (not just equity) by their real demo return so the row surfaces genuine
  // strong performers rather than an arbitrary asset-class slice.
  const recommended = [...funds]
    .sort((a, b) => (demoReturnPct(b) ?? -Infinity) - (demoReturnPct(a) ?? -Infinity))
    .slice(0, 4);

  return (
    <div className="space-y-6 px-4 pb-24">
      {/* Promo */}
      <div className="flex items-center justify-between rounded-3xl bg-emerald-50 p-5">
        <div className="pr-3">
          <p className="text-lg font-bold text-slate-900">You&apos;re ready to invest!</p>
          <p className="mt-1 text-sm text-slate-600">
            Pick your fund, set up your SIP and relax. We&apos;ll guide you all the way.
          </p>
          <button className="mt-3 rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white">
            Start now
          </button>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-semibold text-white">
          ₹
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTS.map((p) => (
            <div key={p.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
                {p.icon}
              </div>
              <p className="text-sm font-medium text-slate-800">{p.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
            🦊
          </div>
          <p className="text-sm font-medium text-slate-800">SIF</p>
        </div>
      </div>

      {/* Recommended */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recommended Funds</h2>
          <span className="text-sm font-medium text-slate-500">View All</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recommended.map((f) => {
            const returnPct = demoReturnPct(f);
            const rating = starRating(f);
            return (
              <div
                key={f.id}
                className="w-56 shrink-0 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-sm font-semibold text-white">
                    ₹
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    👥 {investorCountLabel(f)}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm font-bold text-slate-900">{f.name}</p>

                <p className="mt-1 text-xs text-amber-500">
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </p>

                {returnPct !== undefined ? (
                  <div className="mt-2">
                    <p className={`text-lg font-bold ${returnPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {returnPct >= 0 ? "+" : ""}
                      {returnPct.toFixed(2)}%
                    </p>
                    <p className="text-[11px] text-slate-500">Since inception (demo)</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Add to start investing</p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-sm text-slate-500">
                    🛒
                  </div>
                  <button
                    type="button"
                    aria-label={`Add ${f.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-700 text-sm font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
