import { getSnapshotById, getSnapshots } from "@/lib/data/repository";
import type { PortfolioSnapshot } from "@/lib/data/types";

export const CURSOR_STORAGE_KEY = "pulse:cursor";
export const DEFAULT_CURSOR_INDEX = 1;

export interface FromToSnapshots {
  from: PortfolioSnapshot;
  to: PortfolioSnapshot;
  cursorIndex: number;
  isFirstVisit: boolean;
}

/**
 * Resolves which two snapshots to diff. Manual `?from=&to=` snapshot ids take
 * priority (used for demo/presentation purposes); otherwise falls back to a
 * cursor index into the ordered snapshot array, where "last visit" is always
 * `cursorIndex - 1`.
 */
export function resolveSnapshotPair(params: {
  from?: string;
  to?: string;
  cursor?: string;
}): FromToSnapshots {
  const snapshots = getSnapshots();

  if (params.from && params.to) {
    const from = getSnapshotById(params.from);
    const to = getSnapshotById(params.to);
    if (from && to) {
      return { from, to, cursorIndex: snapshots.indexOf(to), isFirstVisit: false };
    }
  }

  const requestedIndex = params.cursor ? parseInt(params.cursor, 10) : DEFAULT_CURSOR_INDEX;
  const cursorIndex = Number.isFinite(requestedIndex)
    ? Math.min(Math.max(requestedIndex, 0), snapshots.length - 1)
    : DEFAULT_CURSOR_INDEX;

  if (cursorIndex === 0) {
    return { from: snapshots[0], to: snapshots[0], cursorIndex: 0, isFirstVisit: true };
  }

  return {
    from: snapshots[cursorIndex - 1],
    to: snapshots[cursorIndex],
    cursorIndex,
    isFirstVisit: false,
  };
}

export function getSnapshotCount(): number {
  return getSnapshots().length;
}
