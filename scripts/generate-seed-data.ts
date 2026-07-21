// One-time deterministic generator for Portfolio Pulse AI's demo dataset.
// Run with `npm run seed`. Output is checked into src/lib/data/seeds/*.json —
// there is no runtime randomness in the app itself, only here.
//
// Generation order matters: macro events are authored first as the "source of
// truth" narrative, market indices react to those events, fund NAVs are then
// derived as a weighted blend of the indices each fund is exposed to (plus a
// small idiosyncratic noise term). This makes "IT sector rallied" mechanically
// show up as a NAV uptick in IT-tilted funds, rather than hoping two
// independent random walks happen to correlate.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  Fund,
  MacroEvent,
  MarketIndexName,
  MarketIndexPoint,
  NavPoint,
  Transaction,
  PortfolioSnapshot,
  AssetClass,
  User,
} from "../src/lib/data/types";

// --- Seeded PRNG (mulberry32) so re-running this script is reproducible ---
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260407);
const noise = (sigma: number) => (rng() - 0.5) * 2 * sigma;

// --- Date range: 91 days ending on the project's "today" ---
const START_DATE = new Date("2026-04-06T00:00:00Z");
const NUM_DAYS = 91;
const DATES: string[] = Array.from({ length: NUM_DAYS }, (_, i) => {
  const d = new Date(START_DATE);
  d.setUTCDate(d.getUTCDate() + i);
  return d.toISOString().slice(0, 10);
});
const dateForOffset = (offset: number) => DATES[offset];

// --- 1. Fund roster ---
const FUNDS: Fund[] = [
  {
    id: "FI-001",
    name: "FundsIndia Bluechip Growth Fund",
    amc: "FundsIndia AMC",
    category: "Large Cap",
    assetClass: "equity",
    sectorTilt: ["Banking", "Diversified"],
    riskLevel: "moderate",
    inceptionNav: 145,
    expenseRatio: 0.9,
  },
  {
    id: "FI-002",
    name: "FundsIndia Tech Opportunities Fund",
    amc: "FundsIndia AMC",
    category: "Sectoral - IT",
    assetClass: "equity",
    sectorTilt: ["IT"],
    riskLevel: "high",
    inceptionNav: 62,
    expenseRatio: 1.1,
  },
  {
    id: "FI-003",
    name: "FundsIndia Emerging Small Cap Fund",
    amc: "FundsIndia AMC",
    category: "Small Cap",
    assetClass: "equity",
    sectorTilt: ["Auto", "Infra", "Diversified"],
    riskLevel: "very high",
    inceptionNav: 38,
    expenseRatio: 1.3,
  },
  {
    id: "FI-004",
    name: "FundsIndia US Equity Fund of Fund",
    amc: "FundsIndia AMC",
    category: "International - US",
    assetClass: "international",
    sectorTilt: ["Global", "IT"],
    riskLevel: "high",
    inceptionNav: 28,
    expenseRatio: 1.2,
  },
  {
    id: "FI-005",
    name: "FundsIndia Short Duration Debt Fund",
    amc: "FundsIndia AMC",
    category: "Debt - Short Duration",
    assetClass: "debt",
    // No sector tilt: debt funds' relevance comes from asset-class matching
    // (rate_expectations events), not equity-style sector rallies.
    sectorTilt: [],
    riskLevel: "low",
    inceptionNav: 24,
    expenseRatio: 0.4,
  },
  {
    id: "FI-006",
    name: "FundsIndia Liquid Fund",
    amc: "FundsIndia AMC",
    category: "Liquid",
    assetClass: "liquid",
    sectorTilt: [],
    riskLevel: "low",
    inceptionNav: 1850,
    expenseRatio: 0.2,
  },
  {
    id: "FI-007",
    name: "FundsIndia Gold ETF Fund of Fund",
    amc: "FundsIndia AMC",
    category: "Gold ETF",
    assetClass: "gold",
    sectorTilt: ["Gold"],
    riskLevel: "moderate",
    inceptionNav: 55,
    expenseRatio: 0.5,
  },
];

// --- 2. Macro event timeline (the narrative source of truth) ---
const sentimentSign = (s: MacroEvent["sentiment"]) =>
  s === "positive" ? 1 : s === "negative" ? -1 : 0;

const MACRO_EVENTS: MacroEvent[] = [
  {
    id: "evt-01",
    date: dateForOffset(5),
    headline: "RBI holds repo rate steady, signals rates may stay higher for longer",
    category: "rate_expectations",
    relatedSectors: ["Banking"],
    relatedAssetClasses: ["debt"],
    sentiment: "negative",
    magnitude: 0.5,
    summary:
      "The Reserve Bank of India kept the repo rate unchanged and indicated that interest rates could remain elevated for longer than previously expected.",
  },
  {
    id: "evt-02",
    date: dateForOffset(10),
    headline: "IT sector rallies after strong Q4 earnings and robust US tech demand",
    category: "sector_movement",
    relatedSectors: ["IT", "Global"],
    relatedAssetClasses: ["equity", "international"],
    sentiment: "positive",
    magnitude: 0.7,
    summary:
      "Major IT exporters reported better-than-expected quarterly earnings, and demand from US technology clients remained strong, lifting IT sector stocks.",
  },
  {
    id: "evt-03",
    date: dateForOffset(14),
    headline: "Nifty and Sensex see mild correction after recent highs",
    category: "market_correction",
    relatedSectors: ["Diversified"],
    relatedAssetClasses: ["equity"],
    sentiment: "negative",
    magnitude: 0.4,
    summary:
      "Indian benchmark indices corrected mildly as investors booked profits following a recent run-up to new highs.",
  },
  {
    id: "evt-04",
    date: dateForOffset(20),
    headline: "Banking stocks gain on better-than-expected credit growth",
    category: "sector_movement",
    relatedSectors: ["Banking"],
    relatedAssetClasses: ["equity"],
    sentiment: "positive",
    magnitude: 0.5,
    summary:
      "Banks reported stronger credit growth numbers than analysts expected, pushing banking sector stocks higher.",
  },
  {
    id: "evt-05",
    date: dateForOffset(26),
    headline: "US Nasdaq declines on tech valuation concerns",
    category: "global_markets",
    relatedSectors: ["IT", "Global"],
    relatedAssetClasses: ["international"],
    sentiment: "negative",
    magnitude: 0.6,
    summary:
      "US technology stocks fell as investors grew cautious about stretched valuations in the sector.",
  },
  {
    id: "evt-06",
    date: dateForOffset(32),
    headline: "Rupee weakens against the dollar amid rising crude oil prices",
    category: "currency",
    relatedSectors: ["Diversified"],
    relatedAssetClasses: ["international"],
    sentiment: "negative",
    magnitude: 0.3,
    summary:
      "The Indian Rupee weakened against the US Dollar as crude oil prices climbed, raising import cost concerns.",
  },
  {
    id: "evt-07",
    date: dateForOffset(38),
    headline: "Manufacturing PMI beats expectations, small and mid-cap stocks gain",
    category: "sector_movement",
    relatedSectors: ["Auto", "Infra", "Diversified"],
    relatedAssetClasses: ["equity"],
    sentiment: "positive",
    magnitude: 0.65,
    summary:
      "Manufacturing activity data came in stronger than expected, boosting infrastructure and auto-linked small and mid-cap stocks.",
  },
  {
    id: "evt-08",
    date: dateForOffset(44),
    headline: "RBI commentary hints at a possible rate cut later in the year",
    category: "rate_expectations",
    relatedSectors: ["Banking"],
    relatedAssetClasses: ["debt"],
    sentiment: "positive",
    magnitude: 0.4,
    summary:
      "The central bank's policy commentary suggested it may consider cutting rates later in the year if inflation continues to ease.",
  },
  {
    id: "evt-09",
    date: dateForOffset(50),
    headline: "Broader markets correct sharply amid global risk-off sentiment",
    category: "market_correction",
    relatedSectors: ["Diversified"],
    relatedAssetClasses: ["equity"],
    sentiment: "negative",
    magnitude: 0.75,
    summary:
      "Indian equity markets fell sharply, tracking a broad risk-off move across global markets.",
  },
  {
    id: "evt-10",
    date: dateForOffset(55),
    headline: "US Federal Reserve signals pause in rate hikes",
    category: "global_markets",
    relatedSectors: ["Global"],
    relatedAssetClasses: ["international"],
    sentiment: "positive",
    magnitude: 0.5,
    summary:
      "The US Federal Reserve signaled it would pause further rate hikes, boosting risk appetite in global markets.",
  },
  {
    id: "evt-11",
    date: dateForOffset(60),
    headline: "IT stocks correct after a major exporter cuts revenue guidance",
    category: "sector_movement",
    relatedSectors: ["IT"],
    relatedAssetClasses: ["equity", "international"],
    sentiment: "negative",
    magnitude: 0.55,
    summary:
      "A large IT exporter lowered its revenue guidance for the year, weighing on IT sector stocks broadly.",
  },
  {
    id: "evt-12",
    date: dateForOffset(66),
    headline: "Rupee strengthens as crude oil prices ease",
    category: "currency",
    relatedSectors: ["Diversified"],
    relatedAssetClasses: ["international"],
    sentiment: "positive",
    magnitude: 0.25,
    summary:
      "The Rupee strengthened against the Dollar as crude oil prices retreated from recent highs.",
  },
  {
    id: "evt-13",
    date: dateForOffset(70),
    headline: "Small-cap stocks rally on strong industrial production data",
    category: "sector_movement",
    relatedSectors: ["Auto", "Infra", "Diversified"],
    relatedAssetClasses: ["equity"],
    sentiment: "positive",
    magnitude: 0.6,
    summary:
      "Industrial production data exceeded expectations, driving a rally in small-cap and infrastructure-linked stocks.",
  },
  {
    id: "evt-14",
    date: dateForOffset(74),
    headline: "RBI maintains repo rate, reiterates wait-and-watch stance",
    category: "rate_expectations",
    relatedSectors: ["Banking"],
    relatedAssetClasses: ["debt"],
    sentiment: "neutral",
    magnitude: 0.3,
    summary:
      "The Reserve Bank of India held rates steady again, reiterating a cautious, data-dependent approach.",
  },
  {
    id: "evt-15",
    date: dateForOffset(78),
    headline: "Global technology stocks correct on mixed earnings",
    category: "global_markets",
    relatedSectors: ["IT", "Global"],
    relatedAssetClasses: ["international"],
    sentiment: "negative",
    magnitude: 0.6,
    summary:
      "Major US technology companies reported mixed earnings, triggering a correction in global tech stocks.",
  },
  {
    id: "evt-16",
    date: dateForOffset(82),
    headline: "Gold rallies on safe-haven demand amid geopolitical tensions",
    category: "sector_movement",
    relatedSectors: ["Gold"],
    relatedAssetClasses: ["gold"],
    sentiment: "positive",
    magnitude: 0.5,
    summary:
      "Gold prices rose as investors sought safe-haven assets amid rising geopolitical tensions.",
  },
  {
    id: "evt-17",
    date: dateForOffset(86),
    headline: "Markets recover modestly as inflation data comes in below expectations",
    category: "market_correction",
    relatedSectors: ["Diversified"],
    relatedAssetClasses: ["equity"],
    sentiment: "positive",
    magnitude: 0.4,
    summary:
      "Indian equity markets recovered some lost ground after inflation data came in cooler than expected.",
  },
  {
    id: "evt-18",
    date: dateForOffset(89),
    headline: "Banking stocks dip slightly on profit booking after recent rally",
    category: "sector_movement",
    relatedSectors: ["Banking"],
    relatedAssetClasses: ["equity"],
    sentiment: "negative",
    magnitude: 0.3,
    summary:
      "Banking stocks eased slightly as investors booked profits following their recent rally.",
  },
];

// --- 3. Market index history: seeded random walk + event-driven drift ---
const INDEX_NAMES: MarketIndexName[] = [
  "NIFTY50",
  "SENSEX",
  "NIFTY_IT",
  "NIFTY_BANK",
  "NIFTY_SMALLCAP",
  "MSCI_WORLD",
  "GOLD_INR",
  "INR_USD",
];

const INDEX_BASE_VALUE: Record<MarketIndexName, number> = {
  NIFTY50: 22000,
  SENSEX: 72000,
  NIFTY_IT: 38000,
  NIFTY_BANK: 48000,
  NIFTY_SMALLCAP: 16000,
  MSCI_WORLD: 3200,
  GOLD_INR: 7200,
  INR_USD: 83.5,
};

// Daily background volatility per index (roughly reflects real-world beta).
const INDEX_DAILY_SIGMA: Record<MarketIndexName, number> = {
  NIFTY50: 0.006,
  SENSEX: 0.006,
  NIFTY_IT: 0.009,
  NIFTY_BANK: 0.008,
  NIFTY_SMALLCAP: 0.011,
  MSCI_WORLD: 0.005,
  GOLD_INR: 0.004,
  INR_USD: 0.002,
};

// Which indices react to a given event, and how much of the event's
// magnitude*sentiment each one absorbs (weights need not sum to 1).
function affectedIndices(event: MacroEvent): Partial<Record<MarketIndexName, number>> {
  switch (event.category) {
    case "market_correction":
      return { NIFTY50: 0.4, SENSEX: 0.4, NIFTY_SMALLCAP: 0.5 };
    case "rate_expectations":
      return { NIFTY_BANK: 0.3 };
    case "global_markets":
      return { MSCI_WORLD: 0.7, NIFTY_IT: 0.3 };
    case "currency":
      return { INR_USD: 1.0 };
    case "sector_movement":
      if (event.relatedSectors.includes("IT")) return { NIFTY_IT: 1.0 };
      if (event.relatedSectors.includes("Banking")) return { NIFTY_BANK: 1.0 };
      if (event.relatedSectors.includes("Gold")) return { GOLD_INR: 1.0 };
      return { NIFTY_SMALLCAP: 0.7, NIFTY50: 0.3 };
    default:
      return {};
  }
}

// Precompute, per index, a map of date -> extra event-driven daily return.
// Each event's effect is spread over 3 days starting on its event date.
const EVENT_EFFECT_SPREAD_DAYS = 3;
const BASE_BUMP_PCT = 0.03; // an event with magnitude 1.0 moves its index ~3% total

const eventEffectByIndexAndDate: Record<MarketIndexName, Record<string, number>> = Object.fromEntries(
  INDEX_NAMES.map((name) => [name, {}])
) as Record<MarketIndexName, Record<string, number>>;

for (const event of MACRO_EVENTS) {
  const eventDayIdx = DATES.indexOf(event.date);
  const weights = affectedIndices(event);
  for (const [indexName, weight] of Object.entries(weights) as [MarketIndexName, number][]) {
    const totalMove = BASE_BUMP_PCT * event.magnitude * sentimentSign(event.sentiment) * weight;
    const perDayMove = totalMove / EVENT_EFFECT_SPREAD_DAYS;
    for (let d = 0; d < EVENT_EFFECT_SPREAD_DAYS; d++) {
      const idx = eventDayIdx + d;
      if (idx >= DATES.length) continue;
      const date = DATES[idx];
      eventEffectByIndexAndDate[indexName][date] =
        (eventEffectByIndexAndDate[indexName][date] ?? 0) + perDayMove;
    }
  }
}

const marketIndices: MarketIndexPoint[] = [];
const indexReturnByDate = Object.fromEntries(
  INDEX_NAMES.map((name) => [name, [] as number[]])
) as Record<MarketIndexName, number[]>;

for (const indexName of INDEX_NAMES) {
  let value = INDEX_BASE_VALUE[indexName];
  for (let i = 0; i < DATES.length; i++) {
    const date = DATES[i];
    const backgroundReturn = noise(INDEX_DAILY_SIGMA[indexName]);
    const eventReturn = eventEffectByIndexAndDate[indexName][date] ?? 0;
    const dailyReturn = backgroundReturn + eventReturn;
    if (i > 0) value = value * (1 + dailyReturn);
    indexReturnByDate[indexName].push(dailyReturn);
    marketIndices.push({ index: indexName, date, value: Math.round(value * 100) / 100 });
  }
}

// --- 4. Fund NAV history, derived from the indices each fund is exposed to ---
interface FundIndexBlend {
  weights: Partial<Record<MarketIndexName, number>>;
  beta: number; // multiplier applied to the blended index return
  noiseSigma: number;
}

const FUND_BLEND: Record<string, FundIndexBlend> = {
  "FI-001": { weights: { NIFTY50: 0.5, NIFTY_BANK: 0.35 }, beta: 1.0, noiseSigma: 0.0025 },
  "FI-002": { weights: { NIFTY_IT: 0.85 }, beta: 1.1, noiseSigma: 0.003 },
  "FI-003": { weights: { NIFTY_SMALLCAP: 0.75, NIFTY50: 0.15 }, beta: 1.2, noiseSigma: 0.0035 },
  "FI-004": { weights: { MSCI_WORLD: 0.8, INR_USD: 0.15 }, beta: 1.0, noiseSigma: 0.002 },
  "FI-005": { weights: {}, beta: 1.0, noiseSigma: 0.0004 }, // handled via debt rate sensitivity below
  "FI-006": { weights: {}, beta: 1.0, noiseSigma: 0.0001 }, // near-flat liquid fund
  "FI-007": { weights: { GOLD_INR: 0.9 }, beta: 1.0, noiseSigma: 0.0015 },
};

// Debt funds react directly to rate_expectations events rather than an index.
const DEBT_RATE_EFFECT_SPREAD_DAYS = 3;
const debtEventEffectByDate: Record<string, number> = {};
for (const event of MACRO_EVENTS.filter((e) => e.category === "rate_expectations")) {
  const eventDayIdx = DATES.indexOf(event.date);
  const totalMove = 0.002 * event.magnitude * sentimentSign(event.sentiment);
  const perDayMove = totalMove / DEBT_RATE_EFFECT_SPREAD_DAYS;
  for (let d = 0; d < DEBT_RATE_EFFECT_SPREAD_DAYS; d++) {
    const idx = eventDayIdx + d;
    if (idx >= DATES.length) continue;
    const date = DATES[idx];
    debtEventEffectByDate[date] = (debtEventEffectByDate[date] ?? 0) + perDayMove;
  }
}

const DEBT_CARRY_DAILY_RETURN = 0.0002; // small steady positive drift (accrued interest)
const LIQUID_CARRY_DAILY_RETURN = 0.00012;

const navHistory: NavPoint[] = [];
const navByFundAndDate: Record<string, Record<string, number>> = {};

for (const fund of FUNDS) {
  const blend = FUND_BLEND[fund.id];
  let nav = fund.inceptionNav;
  navByFundAndDate[fund.id] = {};
  for (let i = 0; i < DATES.length; i++) {
    const date = DATES[i];
    let dailyReturn = 0;

    const weightEntries = Object.entries(blend.weights) as [MarketIndexName, number][];
    if (weightEntries.length > 0) {
      const blendedIndexReturn = weightEntries.reduce(
        (sum, [indexName, weight]) => sum + indexReturnByDate[indexName][i] * weight,
        0
      );
      dailyReturn += blendedIndexReturn * blend.beta;
    }

    if (fund.id === "FI-005") {
      dailyReturn += DEBT_CARRY_DAILY_RETURN + (debtEventEffectByDate[date] ?? 0);
    }
    if (fund.id === "FI-006") {
      dailyReturn += LIQUID_CARRY_DAILY_RETURN;
    }

    dailyReturn += noise(blend.noiseSigma);

    if (i > 0) nav = nav * (1 + dailyReturn);
    const roundedNav = Math.round(nav * 100) / 100;
    navByFundAndDate[fund.id][date] = roundedNav;
    navHistory.push({ fundId: fund.id, date, nav: roundedNav });
  }
}

// --- 5. Transactions: a handful of hand-placed story beats ---
// Liquid (FI-006) and Gold (FI-007) intentionally receive zero transactions,
// setting up the "idle liquid fund" / "no rebalancing" opportunity nudges.
const transactions: Transaction[] = [];
let txnCounter = 1;
function addTransaction(dayOffset: number, fundId: string, type: Transaction["type"], amount: number) {
  const date = dateForOffset(dayOffset);
  const nav = navByFundAndDate[fundId][date];
  const units = Math.round((amount / nav) * 1000) / 1000;
  transactions.push({
    id: `txn-${String(txnCounter++).padStart(3, "0")}`,
    date,
    fundId,
    type,
    amount,
    units,
    navAtTransaction: nav,
  });
}

// Monthly SIPs into the two largest equity holdings, on/around the 5th of each "month" (~30 days apart).
for (const dayOffset of [15, 45, 75]) {
  addTransaction(dayOffset, "FI-001", "sip", 5000);
  addTransaction(dayOffset, "FI-002", "sip", 3000);
}
// One lump-sum top-up into the international fund.
addTransaction(40, "FI-004", "buy", 50000);
// A small trim of the small-cap fund after its rally, ahead of the next snapshot.
addTransaction(72, "FI-003", "sell", 15000);

// --- 6. Portfolio snapshots ("simulated login sessions") ---
const OPENING_HOLDINGS: Record<string, number> = {
  "FI-001": 2068.966,
  "FI-002": 2419.355,
  "FI-003": 2577.632,
  "FI-004": 2107.5,
  "FI-005": 4566.25,
  "FI-006": 45.568,
  "FI-007": 766.364,
};

const SNAPSHOT_DAY_OFFSETS = [0, 12, 24, 38, 50, 62, 76, 90];

function holdingsAsOf(dayOffset: number): Record<string, number> {
  const date = dateForOffset(dayOffset);
  const holdings: Record<string, number> = { ...OPENING_HOLDINGS };
  for (const txn of transactions) {
    if (txn.date <= date) {
      const sign = txn.type === "sell" ? -1 : 1;
      holdings[txn.fundId] = (holdings[txn.fundId] ?? 0) + sign * txn.units;
    }
  }
  return holdings;
}

const ASSET_CLASSES: AssetClass[] = ["equity", "debt", "international", "liquid", "gold"];

const snapshots: PortfolioSnapshot[] = SNAPSHOT_DAY_OFFSETS.map((dayOffset, i) => {
  const date = dateForOffset(dayOffset);
  const holdingsMap = holdingsAsOf(dayOffset);
  const holdings = Object.entries(holdingsMap).map(([fundId, units]) => ({ fundId, units }));

  let totalValue = 0;
  const valueByAssetClass: Record<AssetClass, number> = {
    equity: 0,
    debt: 0,
    international: 0,
    liquid: 0,
    gold: 0,
  };
  for (const { fundId, units } of holdings) {
    const fund = FUNDS.find((f) => f.id === fundId)!;
    const nav = navByFundAndDate[fundId][date];
    const value = units * nav;
    totalValue += value;
    valueByAssetClass[fund.assetClass] += value;
  }

  const allocation = Object.fromEntries(
    ASSET_CLASSES.map((ac) => [ac, Math.round((valueByAssetClass[ac] / totalValue) * 1000) / 10])
  ) as Record<AssetClass, number>;

  return {
    id: `snap-${String(i + 1).padStart(2, "0")}`,
    date,
    holdings,
    totalValue: Math.round(totalValue * 100) / 100,
    allocation,
  };
});

const user: User = {
  id: "user-001",
  name: "Demo Investor",
  portfolioId: "portfolio-001",
};

// --- 6b. Long-term NAV history: 5 years of monthly points per fund, ---
// --- ending right where the detailed 90-day window begins.          ---
// Used for the "Since You Invested" illustration and the Yearly history
// tab — always real, computed data, never a fabricated headline number.
const LONG_TERM_MONTHS = 60;

const LONG_TERM_PARAMS: Record<Fund["riskLevel"], { monthlyDrift: number; monthlySigma: number }> = {
  low: { monthlyDrift: 0.005, monthlySigma: 0.003 },
  moderate: { monthlyDrift: 0.009, monthlySigma: 0.015 },
  high: { monthlyDrift: 0.011, monthlySigma: 0.03 },
  "very high": { monthlyDrift: 0.013, monthlySigma: 0.045 },
};

function monthsBeforeStart(months: number): string {
  const d = new Date(START_DATE);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

const longTermNavHistory: NavPoint[] = [];

for (const fund of FUNDS) {
  const params = LONG_TERM_PARAMS[fund.riskLevel];
  const rawSeries: number[] = [1]; // normalized, rescaled at the end
  for (let m = 1; m <= LONG_TERM_MONTHS; m++) {
    const monthlyReturn = params.monthlyDrift + noise(params.monthlySigma);
    rawSeries.push(rawSeries[m - 1] * (1 + monthlyReturn));
  }
  // Rescale so the series' final point (== "now", i.e. day 0 of the
  // detailed window) lands exactly on the fund's existing inceptionNav,
  // so the long-term and detailed datasets connect continuously.
  const scale = fund.inceptionNav / rawSeries[LONG_TERM_MONTHS];
  for (let m = 0; m <= LONG_TERM_MONTHS; m++) {
    const monthsAgo = LONG_TERM_MONTHS - m;
    longTermNavHistory.push({
      fundId: fund.id,
      date: monthsBeforeStart(monthsAgo),
      nav: Math.round(rawSeries[m] * scale * 100) / 100,
    });
  }
}

// --- 7. Write outputs ---
const seedsDir = join(__dirname, "..", "src", "lib", "data", "seeds");
mkdirSync(seedsDir, { recursive: true });

function writeJson(filename: string, data: unknown) {
  writeFileSync(join(seedsDir, filename), JSON.stringify(data, null, 2) + "\n", "utf-8");
}

writeJson("funds.json", FUNDS);
writeJson("macro-events.json", MACRO_EVENTS);
writeJson("market-indices.json", marketIndices);
writeJson("nav-history.json", navHistory);
writeJson("transactions.json", transactions);
writeJson("snapshots.json", snapshots);
writeJson("long-term-nav-history.json", longTermNavHistory);
writeJson("user.json", user);

// --- 8. Sanity check log ---
console.log(`Generated ${DATES.length} days, ${marketIndices.length} index points, ${navHistory.length} NAV points.`);
console.log(`Snapshots: ${snapshots.map((s) => `${s.id}@${s.date}=₹${s.totalValue.toLocaleString("en-IN")}`).join(", ")}`);

const itNavAtEvent = navByFundAndDate["FI-002"][dateForOffset(10)];
const itNavBefore = navByFundAndDate["FI-002"][dateForOffset(8)];
const itNavAfter = navByFundAndDate["FI-002"][dateForOffset(14)];
console.log(
  `Sanity check — IT rally (day 10): FI-002 NAV day8=${itNavBefore} day10=${itNavAtEvent} day14=${itNavAfter} (expect upward move day8->day14)`
);

const ltFirst = longTermNavHistory.find((p) => p.fundId === "FI-001");
const ltLast = [...longTermNavHistory].reverse().find((p) => p.fundId === "FI-001");
console.log(
  `Long-term history: ${longTermNavHistory.length} points total. FI-001 spans ${ltFirst?.date}=${ltFirst?.nav} -> ${ltLast?.date}=${ltLast?.nav} (should connect to inceptionNav=${FUNDS[0].inceptionNav})`
);
