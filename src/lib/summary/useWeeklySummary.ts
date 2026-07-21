"use client";

import { useCallback, useEffect, useState } from "react";
import { markSeen, shouldAutoOpen, currentWeekKey } from "./weeklyGate";

// hidden        -> only the floating icon shows
// entering-top  -> auto/first open, drops down from the top
// open          -> fully visible
// collapsing    -> shrinking toward the corner icon
// entering-corner -> reopened from the icon, grows from the corner
export type OverlayPhase =
  | "hidden"
  | "entering-top"
  | "open"
  | "collapsing"
  | "entering-corner";

export interface WeeklySummaryController {
  phase: OverlayPhase;
  /** The descriptor id currently shown, or null for "this week". */
  activeId: string | null;
  openToday: () => void;
  openDescriptor: (id: string) => void;
  collapse: () => void;
  /** Called by the overlay when its enter/collapse transition ends. */
  onTransitionEnd: () => void;
}

export function useWeeklySummary(): WeeklySummaryController {
  const [phase, setPhase] = useState<OverlayPhase>("hidden");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-open once per week on mount. This must be an effect (not a lazy
  // useState initializer) because shouldAutoOpen reads localStorage, which is
  // unavailable during SSR — computing it at initializer time would make the
  // client's first render disagree with the server-rendered HTML and trigger
  // a hydration mismatch. Running it as a post-mount effect avoids that.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldAutoOpen(window.localStorage, currentWeekKey())) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(null);
      setPhase("entering-top");
    }
  }, []);

  // If the overlay is already open, swap content in place rather than
  // replaying the grow-from-corner animation — that only makes sense when
  // opening from the collapsed/hidden state. Unreachable with today's callers
  // (the floating icon and history rows only invoke these while collapsed),
  // but guarded so a future caller (e.g. switching summaries while one is
  // already open) doesn't get a jarring re-animation.
  const openToday = useCallback(() => {
    setActiveId(null);
    setPhase((p) => (p === "open" ? "open" : "entering-corner"));
  }, []);

  const openDescriptor = useCallback((id: string) => {
    setActiveId(id);
    setPhase((p) => (p === "open" ? "open" : "entering-corner"));
  }, []);

  const collapse = useCallback(() => {
    if (typeof window !== "undefined") markSeen(window.localStorage, currentWeekKey());
    setPhase("collapsing");
  }, []);

  // Only the panel's own transitioning properties should call this — see
  // DailySummaryOverlay's onTransitionEnd handler comment for why it filters
  // by e.target rather than a specific CSS property name.
  const onTransitionEnd = useCallback(() => {
    setPhase((p) => {
      if (p === "entering-top" || p === "entering-corner") return "open";
      if (p === "collapsing") return "hidden";
      return p;
    });
  }, []);

  return { phase, activeId, openToday, openDescriptor, collapse, onTransitionEnd };
}
