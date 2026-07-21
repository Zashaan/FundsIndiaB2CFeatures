// Core domain types for Portfolio Pulse AI.
// Kept provider-agnostic: every field here should make sense whether the data
// comes from the seeded fake dataset or a real FundsIndia integration later.

export type AssetClass =
  | "equity"
  | "debt"
  | "international"
  | "liquid"
  | "gold";

export type Sector =
  | "IT"
  | "Banking"
  | "FMCG"
  | "Pharma"
  | "Energy"
  | "Auto"
  | "Infra"
  | "Diversified"
  | "Global"
  | "Gold";

export type FundCategory =
  | "Large Cap"
  | "Mid Cap"
  | "Small Cap"
  | "Flexi Cap"
  | "Debt - Short Duration"
  | "Debt - Corporate Bond"
  | "International - US"
  | "Liquid"
  | "Sectoral - IT"
  | "Gold ETF";

export type RiskLevel = "low" | "moderate" | "high" | "very high";

export interface Fund {
  id: string;
  name: string;
  amc: string;
  category: FundCategory;
  assetClass: AssetClass;
  /** Sectors this fund is meaningfully exposed to, used for event relevance + attribution matching. */
  sectorTilt: Sector[];
  riskLevel: RiskLevel;
  inceptionNav: number;
  expenseRatio: number;
}

export interface NavPoint {
  fundId: string;
  /** ISO date, e.g. "2026-04-01" */
  date: string;
  nav: number;
}

export type MarketIndexName =
  | "NIFTY50"
  | "SENSEX"
  | "NIFTY_IT"
  | "NIFTY_BANK"
  | "NIFTY_SMALLCAP"
  | "MSCI_WORLD"
  | "GOLD_INR"
  | "INR_USD";

export interface MarketIndexPoint {
  index: MarketIndexName;
  date: string;
  value: number;
}

export type MacroEventCategory =
  | "market_correction"
  | "sector_movement"
  | "rate_expectations"
  | "global_markets"
  | "currency";

export interface MacroEvent {
  id: string;
  date: string;
  headline: string;
  category: MacroEventCategory;
  relatedSectors: Sector[];
  relatedAssetClasses: AssetClass[];
  sentiment: "positive" | "negative" | "neutral";
  /** 0-1 heuristic weight for "how big a deal" this event is, used by the attribution engine. */
  magnitude: number;
  /** Factual, LLM-independent one/two sentence description. Never generated — always authored data. */
  summary: string;
}

export interface Holding {
  fundId: string;
  units: number;
}

export type TransactionType = "buy" | "sell" | "sip" | "dividend_reinvest";

export interface Transaction {
  id: string;
  date: string;
  fundId: string;
  type: TransactionType;
  amount: number;
  units: number;
  navAtTransaction: number;
}

export interface PortfolioSnapshot {
  id: string;
  /** ISO date-time representing a simulated login session ("now" at that point in the demo timeline). */
  date: string;
  holdings: Holding[];
  /** Computed + cached at generation time from holdings * NAV as of `date`. */
  totalValue: number;
  /** Computed + cached at generation time. Percentage points, sums to ~100. */
  allocation: Record<AssetClass, number>;
}

export interface User {
  id: string;
  name: string;
  portfolioId: string;
}
