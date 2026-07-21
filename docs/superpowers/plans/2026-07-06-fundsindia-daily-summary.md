# FundsIndia Daily Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Portfolio Pulse demo into a FundsIndia-styled app with a once-per-day summary popup that collapses into a floating corner icon, a sidebar "Summary" history view, and a Settings toggle — all promotionally framed on real (synthetic) numbers.

**Architecture:** Reuse the existing deterministic engines + LLM briefing layer (`src/lib/engines/*`, `src/lib/llm/*`, `src/lib/data/*`) untouched except for prompt tone. Add a thin summary layer (`src/lib/summary/*`) that enumerates snapshot pairs into "summaries" and owns the once-per-day localStorage gate. Rebuild the presentation: a global app shell (header + sidebar drawer + summary overlay) mounted in the root layout, a reskinned FundsIndia dashboard, a `/summary` history route, and a `/settings` route.

**Tech Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Anthropic SDK for prose (with deterministic fallback). Node's built-in test runner via `tsx` for pure-logic unit tests. CSS-transform animations (no animation library).

**Repo/versioning note:** This project is **not** under git. "Checkpoint" steps below run `npm run lint` + `npm run build` instead of committing. If you want per-task commits, run `git init` first, then treat each Checkpoint as `git add -A && git commit`.

**Spec:** `docs/superpowers/specs/2026-07-06-daily-summary-redesign-design.md`

---

## File Structure

New files:
- `src/lib/summary/types.ts` — `SummaryDescriptor` type.
- `src/lib/summary/summaryList.ts` — enumerates snapshot pairs → descriptors (daily/weekly).
- `src/lib/summary/summaryList.test.ts` — unit tests for the above.
- `src/lib/summary/dailyGate.ts` — pure date-gate helpers (is-today, storage read/write).
- `src/lib/summary/dailyGate.test.ts` — unit tests for the gate.
- `src/lib/summary/useDailySummary.ts` — client hook: overlay phase state machine + gate + enabled flag.
- `src/app/api/summaries/route.ts` — `GET ?cadence=daily|weekly` → descriptors.
- `src/components/shell/AppShell.tsx` — header (avatar/hamburger/bell) + drawer + mounts overlay/icon. Client.
- `src/components/shell/SidebarDrawer.tsx` — FundsIndia-styled nav drawer.
- `src/components/summary/DailySummaryOverlay.tsx` — popup shell + animation + fetches content.
- `src/components/summary/FloatingSummaryIcon.tsx` — corner logo trigger.
- `src/components/summary/SummaryBody.tsx` — stacks the 5 sections from BriefingData + prose.
- `src/components/summary/sections/SummarySection.tsx` — collapsible wrapper (header hook + dropdown).
- `src/components/summary/sections/BestInvestments.tsx` — top-gainer card grid.
- `src/components/summary/sections/WhatChangedTable.tsx` — before→after table.
- `src/components/summary/sections/WhyItChanged.tsx` — attribution + events, reassuring frame.
- `src/components/summary/SummaryHistoryList.tsx` — daily/weekly list with sort.
- `src/components/dashboard/FundsIndiaHome.tsx` — reskinned dashboard body.
- `src/app/summary/page.tsx` — history route.
- `src/app/settings/page.tsx` — settings route.

Modified files:
- `package.json` — add `test` script.
- `src/lib/llm/prompts.ts` — retune `BRIEFING_SYSTEM_PROMPT` for positive spin.
- `src/lib/llm/fallback.ts` — retune deterministic text for positive spin.
- `src/app/layout.tsx` — wrap children in `AppShell`.
- `src/app/dashboard/page.tsx` — render `FundsIndiaHome` instead of `BriefingSections`/`CursorControls`.

Reused unchanged: `src/lib/engines/*`, `src/lib/data/*`, `src/lib/session/cursor.ts`, `src/lib/llm/{client,schemas,jargonGlossary}.ts`, `src/app/api/{snapshot-diff,briefing}/route.ts`, `src/components/ui/*`.

Left on disk but no longer imported (harmless; may be deleted later): `src/components/BriefingSections.tsx`, `src/components/session/CursorControls.tsx`, and the old section components under `src/components/{header,movers,attribution,jargon,allocation,events,insights,concern,opportunities}/`, `src/components/chat/*`, `src/app/api/chat/route.ts`.

---

## Task 1: Add test runner script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the `test` script**

In `package.json`, add a `test` entry to `scripts` (keep the others). The scripts block becomes:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "seed": "tsx scripts/generate-seed-data.ts",
    "test": "node --import tsx --test"
  },
```

- [ ] **Step 2: Verify the runner works with a throwaway check**

Run: `node --import tsx --test --test-name-pattern="__none__" 2>&1 | head -5`
Expected: it runs and reports 0 tests (no error about unknown flags). If you see a loader error, confirm `tsx` is in devDependencies (`npm ls tsx`).

- [ ] **Step 3: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 2: Summary descriptor type + list generator (TDD)

Enumerates the 8 seed snapshots into browsable "summaries". Daily = consecutive pairs; Weekly = 2-step windows. Newest-first. Each descriptor carries a deterministic positive one-line hook and the market-driven % for the mini-stat/sort.

**Files:**
- Create: `src/lib/summary/types.ts`
- Create: `src/lib/summary/summaryList.ts`
- Test: `src/lib/summary/summaryList.test.ts`

- [ ] **Step 1: Write the descriptor type**

Create `src/lib/summary/types.ts`:

```typescript
export type SummaryCadence = "daily" | "weekly";

export interface SummaryDescriptor {
  /** Stable id, e.g. "daily-snap-08" */
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
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/summary/summaryList.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import { getSummaryList, getLatestSummary } from "./summaryList";

test("daily list has one entry per consecutive snapshot pair, newest first", () => {
  const daily = getSummaryList("daily");
  // 8 seed snapshots -> 7 consecutive pairs
  assert.equal(daily.length, 7);
  // newest-first: first entry ends at the last snapshot
  assert.equal(daily[0].toSnapshotId, "snap-08");
  assert.equal(daily[0].fromSnapshotId, "snap-07");
  // every entry is a 1-step window
  for (const d of daily) {
    assert.equal(d.cadence, "daily");
    assert.ok(d.hook.length > 0);
    assert.equal(typeof d.headlinePct, "number");
  }
});

test("weekly list uses 2-step windows and includes the latest snapshot", () => {
  const weekly = getSummaryList("weekly");
  assert.ok(weekly.length >= 1);
  assert.equal(weekly[0].toSnapshotId, "snap-08");
  // 2-step window
  assert.equal(weekly[0].fromSnapshotId, "snap-06");
  for (const w of weekly) assert.equal(w.cadence, "weekly");
});

test("getLatestSummary returns the newest daily descriptor", () => {
  const latest = getLatestSummary();
  assert.equal(latest?.toSnapshotId, "snap-08");
  assert.equal(latest?.cadence, "daily");
});

test("ids are unique within a cadence", () => {
  const ids = getSummaryList("daily").map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/lib/summary/summaryList.test.ts`
Expected: FAIL — `Cannot find module './summaryList'`.

- [ ] **Step 4: Implement the generator**

Create `src/lib/summary/summaryList.ts`:

```typescript
import { getSnapshots } from "@/lib/data/repository";
import { compareSnapshots } from "@/lib/engines/compareSnapshots";
import type { SummaryCadence, SummaryDescriptor } from "./types";

function buildHook(marketPct: number): string {
  if (marketPct > 0.5) return "Your investments moved up — staying invested paid off.";
  if (marketPct >= -0.5) return "A steady period for your portfolio — right on track.";
  return "A small, normal dip — a common short-term market move.";
}

function describe(
  cadence: SummaryCadence,
  fromIdx: number,
  toIdx: number,
  snapshots: ReturnType<typeof getSnapshots>
): SummaryDescriptor {
  const from = snapshots[fromIdx];
  const to = snapshots[toIdx];
  const diff = compareSnapshots(from, to);
  return {
    id: `${cadence}-${to.id}`,
    cadence,
    date: to.date,
    fromSnapshotId: from.id,
    toSnapshotId: to.id,
    headlinePct: diff.marketDrivenPercentChange,
    hook: buildHook(diff.marketDrivenPercentChange),
  };
}

/** Newest-first list of browsable summaries for the given cadence. */
export function getSummaryList(cadence: SummaryCadence): SummaryDescriptor[] {
  const snapshots = getSnapshots();
  const out: SummaryDescriptor[] = [];
  const step = cadence === "weekly" ? 2 : 1;
  for (let to = snapshots.length - 1; to - step >= 0; to -= step) {
    out.push(describe(cadence, to - step, to, snapshots));
  }
  return out; // already newest-first because we walk downward
}

export function getLatestSummary(): SummaryDescriptor | null {
  return getSummaryList("daily")[0] ?? null;
}

export function getDescriptorById(id: string): SummaryDescriptor | null {
  const cadence: SummaryCadence = id.startsWith("weekly-") ? "weekly" : "daily";
  return getSummaryList(cadence).find((d) => d.id === id) ?? null;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/lib/summary/summaryList.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 3: Daily-gate helpers (TDD)

Pure functions for the once-per-day localStorage gate. Kept storage-agnostic (take a `Storage`-like object) so they're testable without a browser.

**Files:**
- Create: `src/lib/summary/dailyGate.ts`
- Test: `src/lib/summary/dailyGate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/summary/dailyGate.test.ts`:

```typescript
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LAST_SEEN_KEY,
  ENABLED_KEY,
  shouldAutoOpen,
  markSeen,
  isEnabled,
  setEnabled,
  clearSeen,
} from "./dailyGate";

function fakeStore(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    _map: map,
  };
}

test("auto-opens when never seen and enabled", () => {
  const s = fakeStore();
  assert.equal(shouldAutoOpen(s, "2026-07-06"), true);
});

test("does not auto-open when already seen today", () => {
  const s = fakeStore({ [LAST_SEEN_KEY]: "2026-07-06" });
  assert.equal(shouldAutoOpen(s, "2026-07-06"), false);
});

test("auto-opens again on a new day", () => {
  const s = fakeStore({ [LAST_SEEN_KEY]: "2026-07-05" });
  assert.equal(shouldAutoOpen(s, "2026-07-06"), true);
});

test("does not auto-open when disabled", () => {
  const s = fakeStore({ [ENABLED_KEY]: "false" });
  assert.equal(shouldAutoOpen(s, "2026-07-06"), false);
});

test("markSeen then shouldAutoOpen is false same day", () => {
  const s = fakeStore();
  markSeen(s, "2026-07-06");
  assert.equal(shouldAutoOpen(s, "2026-07-06"), false);
});

test("clearSeen re-enables auto-open (demo reset)", () => {
  const s = fakeStore({ [LAST_SEEN_KEY]: "2026-07-06" });
  clearSeen(s);
  assert.equal(shouldAutoOpen(s, "2026-07-06"), true);
});

test("enabled defaults true; setEnabled(false) disables", () => {
  const s = fakeStore();
  assert.equal(isEnabled(s), true);
  setEnabled(s, false);
  assert.equal(isEnabled(s), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/summary/dailyGate.test.ts`
Expected: FAIL — `Cannot find module './dailyGate'`.

- [ ] **Step 3: Implement the gate**

Create `src/lib/summary/dailyGate.ts`:

```typescript
export const LAST_SEEN_KEY = "dailySummary:lastSeen";
export const ENABLED_KEY = "dailySummary:enabled";

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

export function markSeen(store: StoreLike, todayIso: string): void {
  store.setItem(LAST_SEEN_KEY, todayIso);
}

export function clearSeen(store: StoreLike): void {
  store.removeItem(LAST_SEEN_KEY);
}

export function shouldAutoOpen(store: StoreLike, todayIso: string): boolean {
  if (!isEnabled(store)) return false;
  return store.getItem(LAST_SEEN_KEY) !== todayIso;
}

/** Local calendar date as YYYY-MM-DD (browser-only helper). */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/summary/dailyGate.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 4: Summaries API route

Exposes descriptors to the client (used by the overlay for "today" and by the history list).

**Files:**
- Create: `src/app/api/summaries/route.ts`

- [ ] **Step 1: Implement the route**

Create `src/app/api/summaries/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSummaryList } from "@/lib/summary/summaryList";
import type { SummaryCadence } from "@/lib/summary/types";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("cadence");
  const cadence: SummaryCadence = raw === "weekly" ? "weekly" : "daily";
  return NextResponse.json({ success: true, data: getSummaryList(cadence) });
}
```

- [ ] **Step 2: Verify it serves data**

Run: `npm run dev` in the background, then:
`curl -s "http://localhost:3000/api/summaries?cadence=daily" | head -c 300`
Expected: JSON `{"success":true,"data":[{"id":"daily-snap-08",...`. Stop dev after.

- [ ] **Step 3: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 5: Retune LLM prompt + fallback for positive spin

Shift the tone from "neutral, never directive" to "positive spin on real numbers" per the spec. No fabricated numbers; foreground gains; frame dips as normal/opportunity; never encourage withdrawals; no fear-based urgency.

**Files:**
- Modify: `src/lib/llm/prompts.ts:4-11` (the `BRIEFING_SYSTEM_PROMPT` constant)
- Modify: `src/lib/llm/fallback.ts` (the insights/concern text builders)

- [ ] **Step 1: Replace the system prompt**

In `src/lib/llm/prompts.ts`, replace the entire `BRIEFING_SYSTEM_PROMPT` string with:

```typescript
export const BRIEFING_SYSTEM_PROMPT = `You are a friendly financial summary writer inside FundsIndia, an Indian mutual-fund investing app. You are given structured, pre-computed facts (numbers, percentages, fund names) about a user's portfolio.

Your job is to turn these facts into an upbeat, encouraging, plain-English summary at roughly an 8th-grade reading level that portrays the user's investing journey with FundsIndia positively. Rules:
- NEVER invent, estimate, or alter any number. Only restate the numbers you are given. The positive tone must come ONLY from which true facts you emphasize and how you frame them.
- Lead with the good news: gains, growth, and the benefit of staying invested. When the portfolio is up, celebrate it plainly.
- Frame declines as normal, temporary, and expected market movement — never alarming. A dip is "a common short-term move" and can be "a chance to keep investing," not a reason to worry.
- Gently encourage continuing to invest (e.g. staying the course, keeping SIPs going). NEVER suggest withdrawing or redeeming money.
- Do NOT use fear, urgency, or pressure ("act now", "you'll lose money"). Stay warm and reassuring.
- Be concise: one to two sentences per item unless asked for a longer summary.
- You must respond by calling the return_briefing tool exactly once with the full structured output. Do not respond with plain text.`;
```

- [ ] **Step 2: Retune the fallback concern map + insights text**

Open `src/lib/llm/fallback.ts`. The concern map is keyed by `reasonCode` (not level). Replace the `CONCERN_NARRATIVE_FALLBACK` constant (lines ~6-11) with positive-spin text for the same four keys:

```typescript
const CONCERN_NARRATIVE_FALLBACK: Record<string, string> = {
  within_normal_range: "Everything looks healthy — your portfolio is moving right in line with the market.",
  elevated_volatility:
    "A little more movement than usual, which is completely normal for a diversified portfolio. Staying invested keeps you on track.",
  large_portfolio_swing:
    "Markets wobbled a bit this period — a common short-term move, not a problem with your funds. Long-term investors usually ride these out.",
  single_fund_drawdown:
    "One fund cooled off after a strong run — a normal part of investing, and often a chance to keep building your position.",
};
```

Then replace the entire `insightsSummary` assignment (lines ~52-64) with a positively-framed version that uses the SAME real variables already in scope (`data.diff`, `data.diff.marketDrivenPercentChange`, `data.movers`, `data.user.name`). Note it drops the "weakest performer" clause to avoid a negative frame:

```typescript
  const firstName = data.user.name.split(" ")[0];
  const insightsSummary = data.diff
    ? `Here's the good news, ${firstName}: ${
        data.diff.marketDrivenPercentChange >= 0
          ? `your investments grew ${Math.abs(
              data.diff.marketDrivenPercentChange
            )}% from market movement this period — staying invested is paying off.`
          : `the wider market dipped ${Math.abs(
              data.diff.marketDrivenPercentChange
            )}%, a normal short-term move, and your diversified mix is built to ride it out.`
      }${
        data.movers?.gainers[0]
          ? ` ${data.movers.gainers[0].fundName} led the way as your strongest performer.`
          : ""
      } Keep it going and your money keeps working for you.`
    : "Welcome! Once your portfolio has had time to move, we'll show you everything that's going well.";
```

> Only these two edits change; the rest of `buildFallbackBriefing` (moversReasons, attributionExplanations, jargonTerms, opportunityNudges, and the `concernNarrative` lookup) stays as-is — the `concernNarrative` line already reads from the map you just retuned.

- [ ] **Step 3: Verify build + a spot check of the fallback text**

Run: `npm run build`
Expected: compiles successfully.

Run: `npm run dev` in the background, then (ANTHROPIC_API_KEY unset → fallback path):
`curl -s -X POST "http://localhost:3000/api/briefing" -H "Content-Type: application/json" -d '{"from":"snap-07","to":"snap-08"}' | head -c 500`
Expected: JSON whose `insightsSummary`/`concernNarrative` read positively (e.g. "good news", "staying invested"). Stop dev after.

- [ ] **Step 4: Checkpoint**

Run: `npm run lint && npm run build`
Expected: both succeed.

---

## Task 6: The daily-summary hook (phase state machine)

Owns overlay phase + the gate. `phase` drives the animation classes. The hook is the single source of truth the shell and icon read.

**Files:**
- Create: `src/lib/summary/useDailySummary.ts`

- [ ] **Step 1: Implement the hook**

Create `src/lib/summary/useDailySummary.ts`:

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import { markSeen, shouldAutoOpen, todayIso } from "./dailyGate";

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

export interface DailySummaryController {
  phase: OverlayPhase;
  /** The descriptor id currently shown, or null for "today". */
  activeId: string | null;
  openToday: () => void;
  openDescriptor: (id: string) => void;
  collapse: () => void;
  /** Called by the overlay when its enter/collapse transition ends. */
  onTransitionEnd: () => void;
}

export function useDailySummary(): DailySummaryController {
  const [phase, setPhase] = useState<OverlayPhase>("hidden");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-open once per day on mount. This must be an effect (not a lazy
  // useState initializer) because shouldAutoOpen reads localStorage, which is
  // unavailable during SSR — computing it at initializer time would make the
  // client's first render disagree with the server-rendered HTML and trigger
  // a hydration mismatch. Running it as a post-mount effect avoids that.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldAutoOpen(window.localStorage, todayIso())) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(null);
      setPhase("entering-top");
    }
  }, []);

  const openToday = useCallback(() => {
    setActiveId(null);
    setPhase("entering-corner");
  }, []);

  const openDescriptor = useCallback((id: string) => {
    setActiveId(id);
    setPhase("entering-corner");
  }, []);

  const collapse = useCallback(() => {
    if (typeof window !== "undefined") markSeen(window.localStorage, todayIso());
    setPhase("collapsing");
  }, []);

  const onTransitionEnd = useCallback(() => {
    setPhase((p) => {
      if (p === "entering-top" || p === "entering-corner") return "open";
      if (p === "collapsing") return "hidden";
      return p;
    });
  }, []);

  return { phase, activeId, openToday, openDescriptor, collapse, onTransitionEnd };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 7: Collapsible section wrapper

Shared building block for the 5 sections: an always-visible header + hook and a dropdown body (collapsed by default). Distinct from the existing `ui/ExpandableCard` because the header here needs a title + hook + chevron layout tuned for the summary.

**Files:**
- Create: `src/components/summary/sections/SummarySection.tsx`

- [ ] **Step 1: Implement the wrapper**

Create `src/components/summary/sections/SummarySection.tsx`:

```tsx
"use client";

import { useState, type ReactNode } from "react";

export function SummarySection({
  title,
  hook,
  defaultOpen = false,
  children,
}: {
  title: string;
  hook?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-900">{title}</span>
          {hook && <span className="mt-0.5 block text-sm text-slate-500">{hook}</span>}
        </span>
        <span className={`mt-1 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">{children}</div>}
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 8: Best Investments section (gainer grid)

**Files:**
- Create: `src/components/summary/sections/BestInvestments.tsx`

- [ ] **Step 1: Implement the component**

Create `src/components/summary/sections/BestInvestments.tsx`. Uses the existing `HoldingDelta` shape (`fundName`, `percentChange`) and `PercentChange`. **2-column grid, no horizontal scroll** (honors "no left-right movement").

```tsx
import { PercentChange } from "@/components/ui/PercentChange";
import type { HoldingDelta } from "@/lib/engines/compareSnapshots";

export function BestInvestments({
  gainers,
  reasons,
}: {
  gainers: HoldingDelta[];
  reasons?: Record<string, string>;
}) {
  if (gainers.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {gainers.map((g) => (
        <div key={g.fundId} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            ₹
          </div>
          <p className="line-clamp-2 text-sm font-medium text-slate-900">{g.fundName}</p>
          <p className="mt-1 text-base font-semibold">
            <PercentChange value={g.percentChange} />
          </p>
          {reasons?.[g.fundId] && <p className="mt-1 text-xs text-slate-500">{reasons[g.fundId]}</p>}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 9: What-Changed table + Why-It-Changed sections

**Files:**
- Create: `src/components/summary/sections/WhatChangedTable.tsx`
- Create: `src/components/summary/sections/WhyItChanged.tsx`

- [ ] **Step 1: Implement the table**

Create `src/components/summary/sections/WhatChangedTable.tsx`. Renders allocation before→after from `SnapshotDiff.allocationDrift`.

```tsx
import type { SnapshotDiff } from "@/lib/engines/compareSnapshots";
import type { AssetClass } from "@/lib/data/types";

const LABEL: Record<AssetClass, string> = {
  equity: "Equity",
  debt: "Debt",
  international: "International",
  liquid: "Liquid",
  gold: "Gold",
};
const ORDER: AssetClass[] = ["equity", "debt", "international", "liquid", "gold"];

export function WhatChangedTable({ diff }: { diff: SnapshotDiff }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
          <th className="pb-2 font-medium">Holding</th>
          <th className="pb-2 text-right font-medium">Before</th>
          <th className="pb-2 text-right font-medium">Now</th>
          <th className="pb-2 text-right font-medium">Change</th>
        </tr>
      </thead>
      <tbody>
        {ORDER.map((ac) => {
          const e = diff.allocationDrift[ac];
          if (e.before === 0 && e.after === 0) return null;
          const label = e.delta === 0 ? "normal" : e.delta > 0 ? `▲ ${Math.abs(e.delta).toFixed(1)}%` : `▼ ${Math.abs(e.delta).toFixed(1)}%`;
          const color = e.delta > 0 ? "text-emerald-600" : e.delta < 0 ? "text-slate-500" : "text-slate-400";
          return (
            <tr key={ac} className="border-t border-slate-100">
              <td className="py-2 font-medium text-slate-700">{LABEL[ac]}</td>
              <td className="py-2 text-right text-slate-500">{e.before}%</td>
              <td className="py-2 text-right text-slate-900">{e.after}%</td>
              <td className={`py-2 text-right font-medium ${color}`}>{label}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Implement the why-it-changed section**

Create `src/components/summary/sections/WhyItChanged.tsx`. Uses `AttributionFactor[]` and the LLM explanations map (falls back to event summaries).

```tsx
import type { AttributionFactor } from "@/lib/engines/attribution";

export function WhyItChanged({
  factors,
  explanations,
}: {
  factors: AttributionFactor[];
  explanations?: Record<string, string>;
}) {
  if (factors.length === 0) return null;
  return (
    <ul className="space-y-3">
      {factors.map((f) => (
        <li key={f.category}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-slate-800">{f.label}</span>
            <span className="text-sm text-slate-500">{f.weightPct}%</span>
          </div>
          <p className="mt-0.5 text-sm text-slate-600">
            {explanations?.[f.category] ?? f.contributingEvents[0]?.summary ?? ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 10: Summary body (assembles the 5 sections + fetches content)

Given a descriptor (or "today"), fetch engine data (`/api/snapshot-diff`) + prose (`/api/briefing`), and render the 5 stacked, vertically-scrolling sections.

**Files:**
- Create: `src/components/summary/SummaryBody.tsx`

- [ ] **Step 1: Implement the body**

Create `src/components/summary/SummaryBody.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { BriefingData } from "@/lib/engines/briefingData";
import type { BriefingResponse } from "@/lib/llm/schemas";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatInr, formatInrSigned, PercentChange } from "@/components/ui/PercentChange";
import { SummarySection } from "./sections/SummarySection";
import { BestInvestments } from "./sections/BestInvestments";
import { WhatChangedTable } from "./sections/WhatChangedTable";
import { WhyItChanged } from "./sections/WhyItChanged";

function toRecord<T extends Record<string, unknown>>(items: T[] | undefined, key: keyof T, valueKey: keyof T) {
  if (!items) return undefined;
  return Object.fromEntries(items.map((i) => [i[key], i[valueKey]])) as Record<string, string>;
}

export function SummaryBody({ from, to }: { from: string; to: string }) {
  const [data, setData] = useState<BriefingData | null>(null);
  const [prose, setProse] = useState<BriefingResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setProse(null);
    const q = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    fetch(`/api/snapshot-diff?${q}`)
      .then((r) => r.json())
      .then((j) => !cancelled && j.success && setData(j.data as BriefingData))
      .catch(() => {});
    fetch(`/api/briefing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    })
      .then((r) => r.json())
      .then((j) => !cancelled && j.success && setProse(j.data as BriefingResponse))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  if (!data || !data.diff) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const { diff } = data;
  const firstName = data.user.name.split(" ")[0];
  const up = diff.marketDrivenPercentChange >= 0;
  const moverReasons = toRecord(prose?.moversReasons, "fundId", "reason");
  const attrExpl = toRecord(prose?.attributionExplanations, "category", "explanation");

  return (
    <div className="space-y-3">
      {/* 1. Summary */}
      <div className="rounded-2xl bg-emerald-600 p-4 text-white">
        <p className="text-sm text-emerald-50">Hey {firstName}, welcome back 👋</p>
        <p className="mt-2 text-2xl font-semibold">{formatInr(diff.totalValueAfter)}</p>
        <p className="mt-1 text-sm">
          <span className="text-emerald-50">{formatInrSigned(diff.absoluteChange)}</span>{" "}
          <PercentChange value={diff.percentChange} className="!text-white" />
        </p>
        <p className="mt-2 text-sm text-emerald-50">
          {up
            ? "Your investments moved up — staying invested is paying off."
            : "The market dipped a little, but your diversified mix is built to ride it out."}
        </p>
      </div>

      {/* 2. Best investments */}
      {data.movers && data.movers.gainers.length > 0 && (
        <SummarySection title="Best Investments Today" hook="Your top performers this period" defaultOpen>
          <BestInvestments gainers={data.movers.gainers} reasons={moverReasons} />
        </SummarySection>
      )}

      {/* 3. Read more */}
      <SummarySection title="Read more" hook="The full story of your period">
        {prose?.insightsSummary ? (
          <p>{prose.insightsSummary}</p>
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
      </SummarySection>

      {/* 4. What changed */}
      <SummarySection title="What changed" hook="Your allocation, before and now">
        <WhatChangedTable diff={diff} />
      </SummarySection>

      {/* 5. Why it changed */}
      <SummarySection title="Why it changed" hook="The market forces behind the move">
        <WhyItChanged factors={data.attribution} explanations={attrExpl} />
      </SummarySection>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 11: Floating corner icon

**Files:**
- Create: `src/components/summary/FloatingSummaryIcon.tsx`

- [ ] **Step 1: Implement the icon**

Create `src/components/summary/FloatingSummaryIcon.tsx`:

```tsx
"use client";

export function FloatingSummaryIcon({ onClick, visible }: { onClick: () => void; visible: boolean }) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open daily summary"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-lg transition-transform active:scale-95"
    >
      ₹
    </button>
  );
}
```

- [ ] **Step 2: Typecheck + checkpoint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

---

## Task 12: The overlay (popup shell + animation)

Ties phase → animation classes, renders `SummaryBody`, handles the X, and calls `onTransitionEnd`. Resolves "today" vs. a descriptor id into `from`/`to` snapshot ids using `getDescriptorById` / `getLatestSummary`.

**Files:**
- Create: `src/components/summary/DailySummaryOverlay.tsx`

- [ ] **Step 1: Implement the overlay**

Create `src/components/summary/DailySummaryOverlay.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OverlayPhase } from "@/lib/summary/useDailySummary";
import { getDescriptorById, getLatestSummary } from "@/lib/summary/summaryList";
import { SummaryBody } from "./SummaryBody";

// Panel transform per visual position. "Corner" = translated toward the
// bottom-right icon and scaled to a dot; "top" = above the screen; "center" =
// the resting open position.
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
    if (phase === "entering-top") {
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
    <div className="fixed inset-0 z-50">
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
          if (e.propertyName === "transform") onTransitionEnd();
        }}
        style={{ transformOrigin: "bottom right" }}
        className={`absolute inset-x-3 top-3 bottom-3 mx-auto flex max-w-md flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl transition-all duration-[350ms] ease-out ${POS[pos]}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-slate-900">Your Daily Summary</span>
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
```

> Implementation note: the `useEffect` sets the panel to its off-screen position for entering phases, then flips to `center` on the next animation frame so the CSS transition runs (drop-in from top, or grow-from-corner on reopen). `collapse()` sets phase `collapsing` → the effect targets `corner` → the panel animates into the icon → `onTransitionEnd` fires and the hook sets phase `hidden`. Because Tailwind must see these class strings statically, the full class literals live in the `POS` map (do not build them dynamically).

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 13: Sidebar drawer

FundsIndia-styled nav. Real labels for authenticity; only Dashboard/Summary/Settings are links.

**Files:**
- Create: `src/components/shell/SidebarDrawer.tsx`

- [ ] **Step 1: Implement the drawer**

Create `src/components/shell/SidebarDrawer.tsx`:

```tsx
"use client";

import Link from "next/link";
import { getUser } from "@/lib/data/repository";

const WIRED = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Summary", href: "/summary" },
  { label: "Settings", href: "/settings" },
];
const PLACEHOLDERS = [
  "Mutual Funds",
  "My Systematic Plans",
  "Nominees",
  "Bank Details",
  "Stocks",
  "SIF",
  "Insights",
];

export function SidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = getUser();
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute left-0 top-0 h-full w-4/5 max-w-xs overflow-y-auto bg-white p-5 shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
        <p className="text-sm text-slate-500">ritikbansal27.rb@gmail.com</p>

        <nav className="mt-6 space-y-1">
          {WIRED.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block rounded-xl px-4 py-3 text-slate-800 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-4">
          {PLACEHOLDERS.map((label) => (
            <div key={label} className="rounded-xl px-4 py-3 text-slate-400">
              {label}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + checkpoint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

---

## Task 14: App shell (header + wires drawer, overlay, icon)

Client component mounted in the root layout. Owns drawer-open state and the `useDailySummary` controller. Hides the floating icon while the overlay is open.

**Files:**
- Create: `src/components/shell/AppShell.tsx`

- [ ] **Step 1: Implement the shell**

Create `src/components/shell/AppShell.tsx`:

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { useDailySummary } from "@/lib/summary/useDailySummary";
import { SidebarDrawer } from "./SidebarDrawer";
import { DailySummaryOverlay } from "@/components/summary/DailySummaryOverlay";
import { FloatingSummaryIcon } from "@/components/summary/FloatingSummaryIcon";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const summary = useDailySummary();
  const overlayActive = summary.phase !== "hidden";

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700"
        >
          RB
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        >
          🔔
        </button>
      </header>

      <main className="flex-1">{children}</main>

      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <DailySummaryOverlay
        phase={summary.phase}
        activeId={summary.activeId}
        onClose={summary.collapse}
        onTransitionEnd={summary.onTransitionEnd}
      />
      <FloatingSummaryIcon onClick={summary.openToday} visible={!overlayActive} />
    </div>
  );
}
```

> Note: the floating icon is `visible={!overlayActive}`, i.e. app-wide but hidden whenever the overlay is on screen (per the spec's scope decision). The history page opens a specific summary via a separate control passed through context in Task 16 — see that task.

- [ ] **Step 2: Typecheck + checkpoint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

---

## Task 15: Mount the shell in the root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Wrap children in AppShell**

In `src/app/layout.tsx`, import and wrap. Change the metadata title too. The file becomes:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FundsIndia",
  description: "Your investments, summarized daily.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify the app boots with the overlay auto-opening**

Run: `npm run dev` (background). Open `http://localhost:3000` in the preview.
Expected: redirects to `/dashboard`; the daily summary drops down from the top automatically on first load; the header shows RB + bell.

- [ ] **Step 3: Checkpoint**

Run: `npm run lint && npm run build`
Expected: both succeed.

---

## Task 16: History page + opening a chosen summary

The `/summary` route lists daily/weekly summaries with a sort toggle. Tapping a row opens that summary in the overlay. Because the overlay controller lives in `AppShell`, expose `openDescriptor` via a small React context so the history page can call it.

**Files:**
- Create: `src/lib/summary/summaryContext.tsx`
- Modify: `src/components/shell/AppShell.tsx`
- Create: `src/components/summary/SummaryHistoryList.tsx`
- Create: `src/app/summary/page.tsx`

- [ ] **Step 1: Create the context**

Create `src/lib/summary/summaryContext.tsx`:

```tsx
"use client";

import { createContext, useContext } from "react";

export interface SummaryContextValue {
  openDescriptor: (id: string) => void;
  openToday: () => void;
}

export const SummaryContext = createContext<SummaryContextValue | null>(null);

export function useSummaryContext(): SummaryContextValue {
  const ctx = useContext(SummaryContext);
  if (!ctx) throw new Error("useSummaryContext must be used within AppShell");
  return ctx;
}
```

- [ ] **Step 2: Provide the context from AppShell**

In `src/components/shell/AppShell.tsx`, import `SummaryContext` and wrap the returned tree. Add the import:

```tsx
import { SummaryContext } from "@/lib/summary/summaryContext";
```

Then wrap the outer `<div>` return value with the provider (place `<SummaryContext.Provider value={{ openDescriptor: summary.openDescriptor, openToday: summary.openToday }}>` immediately inside the component's `return (` and close it at the end):

```tsx
  return (
    <SummaryContext.Provider value={{ openDescriptor: summary.openDescriptor, openToday: summary.openToday }}>
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col">
        {/* ...existing header, main, drawer, overlay, icon... */}
      </div>
    </SummaryContext.Provider>
  );
```

- [ ] **Step 3: Implement the history list**

Create `src/components/summary/SummaryHistoryList.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { SummaryCadence, SummaryDescriptor } from "@/lib/summary/types";
import { PercentChange } from "@/components/ui/PercentChange";
import { useSummaryContext } from "@/lib/summary/summaryContext";

type SortMode = "recent" | "best";

export function SummaryHistoryList() {
  const [cadence, setCadence] = useState<SummaryCadence>("daily");
  const [sort, setSort] = useState<SortMode>("recent");
  const [items, setItems] = useState<SummaryDescriptor[]>([]);
  const { openDescriptor } = useSummaryContext();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/summaries?cadence=${cadence}`)
      .then((r) => r.json())
      .then((j) => !cancelled && j.success && setItems(j.data as SummaryDescriptor[]))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cadence]);

  const sorted =
    sort === "best" ? [...items].sort((a, b) => b.headlinePct - a.headlinePct) : items;

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex gap-2">
        {(["daily", "weekly"] as SummaryCadence[]).map((c) => (
          <button
            key={c}
            onClick={() => setCadence(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              cadence === c ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setSort((s) => (s === "recent" ? "best" : "recent"))}
          className="ml-auto rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600"
        >
          {sort === "recent" ? "Sort: Recent" : "Sort: Best"}
        </button>
      </div>

      <ul className="space-y-2">
        {sorted.map((d) => (
          <li key={d.id}>
            <button
              onClick={() => openDescriptor(d.id)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" }).format(new Date(d.date))}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500">{d.hook}</span>
              </span>
              <PercentChange value={d.headlinePct} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Create the route**

Create `src/app/summary/page.tsx`:

```tsx
import Link from "next/link";
import { SummaryHistoryList } from "@/components/summary/SummaryHistoryList";

export default function SummaryPage() {
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2">
        <Link href="/dashboard" aria-label="Back" className="text-slate-500">
          ←
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">Summary</h1>
      </div>
      <SummaryHistoryList />
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

With dev running, open `/summary` in the preview: Daily/Weekly toggle + sort work; tapping a row opens the overlay for that summary.

- [ ] **Step 6: Checkpoint**

Run: `npm run lint`
Expected: no errors.

---

## Task 17: Settings page (toggle + demo reset)

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/components/settings/SettingsControls.tsx`

- [ ] **Step 1: Implement the controls**

Create `src/components/settings/SettingsControls.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { clearSeen, isEnabled, setEnabled } from "@/lib/summary/dailyGate";

export function SettingsControls() {
  const [enabled, setEnabledState] = useState(true);
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    setEnabledState(isEnabled(window.localStorage));
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(window.localStorage, next);
    setEnabledState(next);
  }

  function reset() {
    clearSeen(window.localStorage);
    setResetMsg("Cleared — reopen the app (or go to Dashboard) to see today's summary again.");
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-slate-800">Daily Summary</span>
        <button
          onClick={toggle}
          role="switch"
          aria-checked={enabled}
          className={`h-6 w-11 rounded-full p-0.5 transition-colors ${enabled ? "bg-emerald-600" : "bg-slate-300"}`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`}
          />
        </button>
      </div>

      <button
        onClick={reset}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-emerald-700"
      >
        Show today&apos;s summary again
      </button>
      {resetMsg && <p className="px-1 text-xs text-slate-500">{resetMsg}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

Create `src/app/settings/page.tsx`:

```tsx
import Link from "next/link";
import { SettingsControls } from "@/components/settings/SettingsControls";

export default function SettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2">
        <Link href="/dashboard" aria-label="Back" className="text-slate-500">
          ←
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
      </div>
      <SettingsControls />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + checkpoint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

---

## Task 18: Reskin the dashboard as the FundsIndia home

Replace the Portfolio Pulse dashboard body with the FundsIndia-styled home (promo card, Products, Recommended Funds). Uses real fund data for the recommended row.

**Files:**
- Create: `src/components/dashboard/FundsIndiaHome.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Implement the home body**

Create `src/components/dashboard/FundsIndiaHome.tsx`:

```tsx
import type { Fund } from "@/lib/data/types";

const PRODUCTS = ["Mutual Funds", "Stocks", "SIF"];

export function FundsIndiaHome({ funds }: { funds: Fund[] }) {
  const recommended = funds.filter((f) => f.assetClass === "equity").slice(0, 4);
  return (
    <div className="space-y-6 px-4 pb-24">
      {/* Promo */}
      <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
        <div className="pr-3">
          <p className="text-lg font-semibold text-slate-900">You&apos;re ready to invest!</p>
          <p className="mt-1 text-sm text-slate-600">
            Pick your fund, set up your SIP and relax. We&apos;ll guide you all the way.
          </p>
          <button className="mt-3 rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white">
            Start now
          </button>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-400 text-2xl text-white">
          ₹
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTS.map((p) => (
            <div key={p} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                ₹
              </div>
              <p className="text-sm font-medium text-slate-800">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recommended Funds</h2>
          <span className="text-sm font-medium text-emerald-700">View All</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recommended.map((f) => (
            <div key={f.id} className="w-56 shrink-0 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                ₹
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">{f.name}</p>
              <p className="mt-1 text-xs text-amber-500">★ {f.riskLevel}</p>
              <p className="mt-2 text-xs text-slate-500">Add to start investing</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

> Note: the Recommended Funds row is on the **dashboard** and may scroll horizontally — the "no left-right movement" rule applies only to the summary popup, not here.

- [ ] **Step 2: Rewrite the dashboard page**

Replace `src/app/dashboard/page.tsx` entirely with:

```tsx
import { getFunds } from "@/lib/data/repository";
import { FundsIndiaHome } from "@/components/dashboard/FundsIndiaHome";

export default function DashboardPage() {
  return <FundsIndiaHome funds={getFunds()} />;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors (note `BriefingSections`/`CursorControls` are now unimported — that's fine).

With dev running, open `/dashboard`: FundsIndia-styled home renders; summary auto-opens on first load; floating icon appears after dismiss.

- [ ] **Step 4: Checkpoint**

Run: `npm run lint && npm run build`
Expected: both succeed.

---

## Task 19: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Full build + lint + unit tests**

Run: `npm run test -- src/lib/summary/summaryList.test.ts && npm run test -- src/lib/summary/dailyGate.test.ts && npm run lint && npm run build`
Expected: all pass.

- [ ] **Step 2: Manual flow in the preview** (dev running)

Verify each, matching the spec's verification section:
1. First open of `/dashboard` → summary drops down from the top automatically; sections stack; vertical scroll only (no horizontal swipe).
2. Tap ✕ → panel shrinks toward the bottom-right into the corner circle; reloading the same day does NOT re-auto-open.
3. Tap the corner circle → panel grows back from the corner with identical content.
4. Corner circle is visible on `/dashboard`, `/summary`, `/settings`; hidden while the overlay is open.
5. Sidebar (tap RB) → "Summary" opens the history; Daily/Weekly toggle + sort work; tapping a row opens that summary in the overlay.
6. `/settings` → toggle off hides auto-open; "Show today's summary again" clears the gate so it re-opens.
7. Spot check the copy reads promotionally (e.g. "staying invested is paying off", dips framed as normal) and every number matches engine output — no fabricated figures.

- [ ] **Step 3: Note the now-unused legacy files**

Confirm these are no longer imported anywhere (they can be deleted in a future cleanup, out of scope here):
Run: `grep -rl "BriefingSections\|CursorControls" src/app src/components || echo "none import them"`
Expected: `none import them` (or only the files themselves).

- [ ] **Step 4: Final checkpoint**

Run: `npm run build`
Expected: success. Feature complete.

---

## Self-Review Notes (author)

- **Spec coverage:** dashboard reskin (T18), sidebar with real labels + 3 wired (T13), app-wide floating icon hidden while open (T14/T11), once-per-day gate + demo reset (T3/T6/T17), dropdown-in / collapse-to-corner animation (T12), 5 sections with collapse (T7–T10), vertical-scroll-only popup (T12 body overflow), Best Investments as grid (T8), positive-spin tone (T5), summary history daily/weekly + sort (T16), settings toggle (T17), seed-data source (T2). All covered.
- **Types:** `SummaryDescriptor`/`SummaryCadence` (T2) used consistently in T4/T16; `OverlayPhase` (T6) used in T12; `BriefingData`/`BriefingResponse`/`HoldingDelta`/`SnapshotDiff`/`AttributionFactor` reused from existing modules with their real field names (verified against source).
- **Animation risk:** T12 is the fiddliest piece. It uses a `useEffect`-driven position state flipped on `requestAnimationFrame` — more reliable than an inline ref callback. Verify in the browser (T19 step 2.1–2.3). If the transition still doesn't fire, the fallback is Framer Motion — but try the plain-CSS path first per the spec.
  - **Post-implementation correction (found during T19 end-to-end verification, not by code review):** the plan's original `onTransitionEnd` handler filtered on `e.propertyName === "transform"`. In the actual browser, Tailwind v4 emits `translate`/`scale` as independent CSS properties rather than composing them into the legacy `transform` shorthand — `getComputedStyle(panel).transform` is literally `"none"`. That filter therefore never matched a real event, so `onTransitionEnd` never fired after the very first render, silently stalling the `OverlayPhase` state machine (it never advanced past `entering-*`/`collapsing`) even though the panel still visually animated correctly (visual position is driven by a separate `pos` state, not gated on this). Symptom: the floating icon never reappeared after closing the popup unless the page was hard-reloaded. Fixed by changing the check to `e.target === e.currentTarget` (ignore only bubbled events from transitioning descendants — there are none here — instead of matching a specific, version-fragile CSS property name). Verified via a real transitionend-driven interaction loop (not blind timeouts): open → close → confirm icon reappears → reopen from icon → close again → confirm icon reappears again, all without a page reload.
- **Client bundling note:** `summaryList.ts` (and its transitive imports `repository.ts` + `compareSnapshots.ts`) are pure TS over seed JSON with no `server-only` guard, so the overlay importing `getLatestSummary`/`getDescriptorById` on the client is safe — it bundles the seed JSON into the client, which is acceptable for a demo.
