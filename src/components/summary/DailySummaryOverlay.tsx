"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OverlayPhase } from "@/lib/summary/useWeeklySummary";
import { getDescriptorById, getLatestSummary } from "@/lib/summary/summaryList";
import { SummaryBody } from "./SummaryBody";

// Panel transform per visual position. "Corner" = translated toward the
// bottom-right icon and scaled to a dot; "top" = above the screen; "center" =
// the resting open position.
//
// The corner offsets (42vw/44vh) and scale (0.04) are hand-tuned to land the
// shrunk panel roughly on top of FloatingSummaryIcon's position
// (`bottom-5 right-5`, a 14x14 circle) so the collapse reads as "sucking
// into" that icon. If FloatingSummaryIcon's position/size changes, these
// values should be re-tuned to match.
const POS = {
  corner: "translate-x-[42vw] translate-y-[44vh] scale-[0.04] opacity-0",
  top: "-translate-y-full opacity-0",
  center: "translate-y-0 translate-x-0 scale-100 opacity-100",
};

export function DailySummaryOverlay({
  phase,
  activeId,
  onClose,
  onTransitionEnd,
}: {
  phase: OverlayPhase;
  activeId: string | null;
  onClose: () => void;
  onTransitionEnd: () => void;
}) {
  const descriptor = useMemo(
    () => (activeId ? getDescriptorById(activeId) : getLatestSummary()),
    [activeId]
  );

  // `pos` is the class the panel currently targets. We start entering phases at
  // their off-screen position, then flip to `center` on the next frame so the
  // CSS transition runs. Collapsing targets `corner` directly.
  const [pos, setPos] = useState<keyof typeof POS>("corner");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // Snapping `pos` to the phase's target (or off-screen start position, to be
    // flipped to "center" next frame) is synchronizing local animation state
    // with the phase prop — the standard React pattern for driving a CSS
    // transition from external state.
    if (phase === "entering-top") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPos("top");
      rafRef.current = requestAnimationFrame(() => setPos("center"));
    } else if (phase === "entering-corner") {
      setPos("corner");
      rafRef.current = requestAnimationFrame(() => setPos("center"));
    } else if (phase === "open") {
      setPos("center");
    } else if (phase === "collapsing") {
      setPos("corner");
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  if (phase === "hidden" || !descriptor) return null;

  return (
    // pointer-events-none while collapsing: the panel is still mid-animation
    // and mounted, but the user has already dismissed it, so clicks on the
    // page underneath (e.g. the header) should pass through immediately
    // rather than being swallowed by this still-full-screen wrapper until
    // the ~350ms shrink animation finishes.
    //
    // entering-top/entering-corner are deliberately NOT given the same
    // treatment: those are modal-open states (the user just triggered the
    // popup, or it auto-opened), so blocking clicks on the page underneath
    // during the brief entrance animation is correct, expected modal
    // behavior — only a dismissal in progress should let clicks through.
    <div className={`fixed inset-0 z-50 ${phase === "collapsing" ? "pointer-events-none" : ""}`}>
      {/* Backdrop — fades out as the panel collapses */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          phase === "collapsing" ? "opacity-0" : "opacity-100"
        }`}
      />
      {/* Panel */}
      <div
        onTransitionEnd={(e) => {
          // Filter by target, not by propertyName: Tailwind v4 emits `translate`/
          // `scale` as independent CSS properties (not the legacy `transform`
          // shorthand), so `computedStyle.transform` stays "none" and a
          // `propertyName === "transform"` check never matches a real event —
          // that filter silently never fires, permanently stalling the phase
          // state machine after the very first render. Checking
          // `e.target === e.currentTarget` instead ignores only bubbled events
          // from transitioning descendants (there are none here), and is robust
          // to whichever properties actually end up transitioning. The
          // onTransitionEnd callback's phase reducer is idempotent, so it's
          // safe to call once per completed property (translate/scale/opacity
          // each fire their own transitionend).
          if (e.target === e.currentTarget) onTransitionEnd();
        }}
        style={{ transformOrigin: "bottom right" }}
        className={`absolute inset-x-3 top-3 bottom-3 mx-auto flex max-w-md flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl transition-all duration-[350ms] ease-out ${POS[pos]}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-slate-900">Your Weekly Summary</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close summary"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600"
          >
            ✕
          </button>
        </div>
        {/* Vertical scroll only */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <SummaryBody from={descriptor.fromSnapshotId} to={descriptor.toSnapshotId} />
        </div>
      </div>
    </div>
  );
}
