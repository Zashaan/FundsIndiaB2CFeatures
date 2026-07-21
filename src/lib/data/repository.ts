// Data access boundary. Every engine and API route reads fund/snapshot/event
// data only through these functions, never by importing the seed JSON
// directly — this is the seam a real FundsIndia integration would replace.

import fundsJson from "./seeds/funds.json";
import macroEventsJson from "./seeds/macro-events.json";
import marketIndicesJson from "./seeds/market-indices.json";
import navHistoryJson from "./seeds/nav-history.json";
import transactionsJson from "./seeds/transactions.json";
import snapshotsJson from "./seeds/snapshots.json";
import longTermNavHistoryJson from "./seeds/long-term-nav-history.json";
import userJson from "./seeds/user.json";
import type {
  Fund,
  MacroEvent,
  MarketIndexPoint,
  NavPoint,
  Transaction,
  PortfolioSnapshot,
  User,
} from "./types";

const funds = fundsJson as Fund[];
const macroEvents = macroEventsJson as MacroEvent[];
const marketIndices = marketIndicesJson as MarketIndexPoint[];
const navHistory = navHistoryJson as NavPoint[];
const transactions = transactionsJson as Transaction[];
const snapshots = snapshotsJson as PortfolioSnapshot[];
const longTermNavHistory = longTermNavHistoryJson as NavPoint[];
const user = userJson as User;

export function getUser(): User {
  return user;
}

export function getFunds(): Fund[] {
  return funds;
}

export function getFundById(fundId: string): Fund | undefined {
  return funds.find((f) => f.id === fundId);
}

/** Ordered oldest -> newest. Index into this array is the "session cursor". */
export function getSnapshots(): PortfolioSnapshot[] {
  return snapshots;
}

export function getSnapshotById(id: string): PortfolioSnapshot | undefined {
  return snapshots.find((s) => s.id === id);
}

export function getTransactionsInRange(fromDateExclusive: string, toDateInclusive: string): Transaction[] {
  return transactions.filter((t) => t.date > fromDateExclusive && t.date <= toDateInclusive);
}

export function getAllTransactions(): Transaction[] {
  return transactions;
}

export function getEventsInRange(fromDateExclusive: string, toDateInclusive: string): MacroEvent[] {
  return macroEvents.filter((e) => e.date > fromDateExclusive && e.date <= toDateInclusive);
}

export function getNavOnOrBefore(fundId: string, date: string): number | undefined {
  const points = navHistory.filter((p) => p.fundId === fundId && p.date <= date);
  if (points.length === 0) return undefined;
  return points[points.length - 1].nav;
}

export function getNavHistoryForFund(fundId: string, fromDate: string, toDate: string): NavPoint[] {
  return navHistory.filter((p) => p.fundId === fundId && p.date >= fromDate && p.date <= toDate);
}

/**
 * Earliest and latest seeded NAV points for a fund, across the full seed
 * history (not a caller-supplied range). Used to derive a demo-honest
 * "since inception (demo)" return from the actual seed data window, rather
 * than fabricating a longer-horizon return figure.
 */
export function getNavRangeForFund(fundId: string): { first: NavPoint; last: NavPoint } | undefined {
  const points = navHistory.filter((p) => p.fundId === fundId).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (points.length === 0) return undefined;
  return { first: points[0], last: points[points.length - 1] };
}

export function getMarketIndexHistory(
  index: MarketIndexPoint["index"],
  fromDate: string,
  toDate: string
): MarketIndexPoint[] {
  return marketIndices.filter((p) => p.index === index && p.date >= fromDate && p.date <= toDate);
}

export function getLongTermNavHistory(fundId: string): NavPoint[] {
  return longTermNavHistory.filter((p) => p.fundId === fundId);
}

export function getLongTermNavOnOrBefore(fundId: string, date: string): number | undefined {
  const points = longTermNavHistory.filter((p) => p.fundId === fundId && p.date <= date);
  if (points.length === 0) return undefined;
  return points[points.length - 1].nav;
}
