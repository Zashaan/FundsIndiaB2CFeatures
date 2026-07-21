export type SummaryCadence = "weekly" | "monthly" | "yearly";

export interface SummaryDescriptor {
  /** Stable id, e.g. "weekly-snap-08" */
  id: string;
  cadence: SummaryCadence;
  /** Display date = the "to" snapshot's date (ISO). */
  date: string;
  fromSnapshotId: string;
  toSnapshotId: string;
  /** Market-driven % change for the window; used for the mini-stat and sort. */
  headlinePct: number;
  /** Deterministic, positively-framed one-line hook for list rows. */
  hook: string;
}
