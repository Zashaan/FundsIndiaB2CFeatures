export const LAST_SEEN_KEY = "weeklySummary:lastSeen";
export const ENABLED_KEY = "weeklySummary:enabled";

interface StoreLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function isEnabled(store: StoreLike): boolean {
  return store.getItem(ENABLED_KEY) !== "false"; // default enabled
}

export function setEnabled(store: StoreLike, enabled: boolean): void {
  store.setItem(ENABLED_KEY, enabled ? "true" : "false");
}

export function markSeen(store: StoreLike, weekKey: string): void {
  store.setItem(LAST_SEEN_KEY, weekKey);
}

export function clearSeen(store: StoreLike): void {
  store.removeItem(LAST_SEEN_KEY);
}

export function shouldAutoOpen(store: StoreLike, weekKey: string): boolean {
  if (!isEnabled(store)) return false;
  return store.getItem(LAST_SEEN_KEY) !== weekKey;
}

/**
 * ISO-8601 week identifier ("YYYY-Www", Monday-start weeks), e.g. "2026-W28".
 * Stable across every day within the same Monday-to-Sunday week, and rolls
 * over exactly at the next Monday. Browser-only helper (uses the local
 * clock, matching the app's existing todayIso-style helpers).
 */
export function currentWeekKey(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // shift to this week's Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
