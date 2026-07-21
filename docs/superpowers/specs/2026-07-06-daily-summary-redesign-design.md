# FundsIndia Daily Summary — Design Spec

Date: 2026-07-06
Status: Approved design (ready for implementation planning)

## Context

The repo currently holds "Portfolio Pulse AI" — a standalone Next.js demo
with a neutral, educational, compliance-cautious tone and a per-session
dashboard (`/dashboard` → `BriefingSections`). The user is pivoting this into
a demo that (a) looks like the real FundsIndia mobile app and (b) shifts tone
to promotional: portray FundsIndia positively, encourage investing more,
discourage withdrawals.

The centerpiece is a **daily summary** that appears at most once a day as a
drop-down popup, collapses into a small floating logo in the bottom-right
corner when dismissed, and can be re-opened from that corner icon or browsed
as history from a new sidebar "Summary" tab.

Reference material: two real FundsIndia app screenshots (side menu + dashboard
home) and three hand-drawn wireframe/notebook pages. Full raw requirements are
preserved in `2026-07-06-daily-summary-redesign-notes.md` alongside this file.

### Decisions locked during brainstorming

- **Data source:** keep the existing synthetic seed data + `repository.ts`
  abstraction. Fully self-contained and reproducible; real DB can swap in
  later behind the same boundary.
- **Tone lean:** "Positive spin, real numbers." Foreground true good-news
  facts, frame dips as normal/opportunity. Never fabricate figures — tone
  lives entirely in *fact selection and framing*, not invented data.
- **Approach:** reuse the deterministic engine + LLM briefing layer, rebuild
  the presentation.
- **Floating-icon scope:** app-wide, hidden only while the popup is open.

## Goals / Non-goals

**Goals**
- A FundsIndia-styled dashboard backdrop matching the real app's look.
- A once-per-day summary popup with a dropdown-in / collapse-to-corner
  animation and a retrievable floating icon.
- A 5-section summary (Summary, Best Investments, Read more, What changed,
  Why it changed) with per-section collapse/expand, promotional framing.
- A sidebar "Summary" history view (Daily/Weekly, sortable, scrollable).
- A Settings screen with a Daily Summary on/off toggle and a demo reset.

**Non-goals**
- Real authentication, real backend persistence, or a real market-data feed.
- Wiring the other real sidebar destinations (Mutual Funds, Stocks, SIF,
  Nominees, etc.) — these are visual-only placeholders.
- Production-grade compliance review of the promotional copy (this is a demo;
  the "positive spin, real numbers" rule is the guardrail).

## Architecture

### Reused as-is (logic layer)
- `src/lib/engines/*` — `compareSnapshots`, `attribution`, `getBiggestMovers`,
  `relevantEvents`, `concernClassifier`, and `briefingData.computeBriefingData`.
  These already produce "what changed / why / biggest movers," mapping 1:1 to
  the summary sections.
- `src/lib/data/*` — seed data + `repository.ts` (the real-data swap boundary).
- `src/lib/llm/*` — briefing generation + deterministic fallback. Prompts get
  re-tuned for the positive-spin tone (see Tone below).

### Rebuilt (presentation layer)

Routes:
- **`/dashboard`** — FundsIndia-styled home: "RB" avatar + hamburger
  (top-left), bell (top-right), green "You're ready to invest!" promo card,
  **Products** section (Mutual Funds / Stocks / SIF cards), horizontally-
  scrollable **Recommended Funds** row. This is the app backdrop.
- **`/summary`** — summary history view (see below).
- **`/settings`** — Daily Summary toggle + demo reset (matches the Settings
  sketch's "System Summary" row).
- **`/`** — redirects to `/dashboard` (unchanged).

Global (mounted in root `layout.tsx`, persist across routes):
- **Sidebar drawer** — opens from the avatar/hamburger. Styled per the real
  side menu: name + email header, "View Old Dashboard" toggle (visual-only),
  nav rows. Real labels shown (Mutual Funds, My Systematic Plans, Nominees,
  Bank Details, Stocks, SIF, Insights) for authenticity, but only
  **Dashboard**, **Summary**, and **Settings** are wired; the rest are inert
  placeholders.
- **`DailySummary` overlay + floating icon** — the popup and its collapsed
  corner-icon state (see Interaction Model).

### Client state (no backend)
`localStorage` keys:
- `dailySummary:lastSeen` — ISO date string of the last day the popup was
  auto-shown/dismissed. Gates the once-per-day auto-open.
- `dailySummary:enabled` — boolean from the Settings toggle (default true).

A small client store/hook (`useDailySummary`) owns popup open/closed/collapsed
state and reads/writes these keys.

## Interaction Model — the popup

States: `hidden` (only the floating circle visible) ↔ `open` (full popup) with
an animated transition between them.

1. **Auto-open (once/day).** On app mount, if `dailySummary:enabled` is true
   and `dailySummary:lastSeen` is not today, the popup animates **down from
   the top** (dropdown) over a dimmed backdrop. "Today's" summary content is
   the **newest snapshot pair** (the most recent diff in the seed data).
2. **Inside the popup.** 5 sections stacked vertically; **vertical scroll
   only**, no horizontal/swipe navigation. An **X** in the top corner.
3. **Dismiss (X).** Popup animates **downward + scales toward the bottom-right
   corner + fades**, collapsing into the small circular logo. On dismiss, set
   `dailySummary:lastSeen = today`.
4. **Floating circle.** Small FundsIndia logo, fixed bottom-right. Tap →
   reverse animation, popup re-expands from the corner. Content is the same
   (not regenerated).
5. **Cadence gate.** Auto-open fires at most once per calendar day. After
   that the circle remains for manual retrieval.
6. **Scope.** The floating circle renders app-wide (all routes), hidden only
   while the popup is `open`.

**Demo reset.** Because real dates don't advance during a demo, Settings
includes "Show today's summary again," which clears `dailySummary:lastSeen`
and re-triggers the auto-open. The "Daily Summary" toggle sets
`dailySummary:enabled`.

**Animation tech.** CSS transforms only — `transform`
(translate to bottom-right + scale down) + `opacity`, with `transform-origin`
at the corner so the collapse reads as being pulled into the circle. ~350ms
ease. No new dependency. (Framer Motion is a possible later upgrade for a
shared-element morph but is out of scope for v1.)

## The 5 Sections

Each section: an **always-visible header + one-line hook**, and a **chevron
dropdown** revealing the detail (collapsed by default). Rendered top-to-bottom
in the vertically-scrolling popup.

1. **Summary** — "Hey [name], welcome back." Signature hook contrasts market
   vs. portfolio when the portfolio did better ("NIFTY 500 dipped, but your
   investments went up"). Source: snapshot diff + `insightsSummary`. Dropdown:
   fuller AI paragraph.
2. **Best Investments (today)** — cards for top gainers
   (`getBiggestMovers().gainers`), styled like the Recommended-Funds cards
   (logo, big % return, short "how it did"). Laid out as a **2-column grid /
   vertical stack** — NOT a horizontal scroller — to honor "no left-right
   movement" inside the popup.
3. **Read more** — expanded descriptive write-up of the summary. Collapsed
   dropdown.
4. **What changed** — a **table**: holdings/allocation before → after. Growth
   emphasized; dips labeled neutrally ("normal fluctuation"). Collapsed
   dropdown.
5. **Why it changed** — attribution factors + relevant events, framed
   reassuringly (a decline → "a common short-term move, not a problem with
   your funds — a chance to keep investing"). Collapsed dropdown.

## Tone (positive spin, real numbers)

- The LLM briefing prompts and the deterministic fallback are re-tuned so
  that: gainers and "staying invested paid off" lead; decliners are reframed
  as normal/temporary/opportunity; withdrawals are never encouraged.
- **Hard rule preserved:** no invented numbers. Every figure comes from the
  engines. Tone is achieved purely through selecting and framing true facts.
  This replaces the prior "never directive, educational only" guardrail; the
  new guardrail is "promotional framing of real facts, never fabricated
  data, never fear-based urgency" (the aggressive urgency option was
  explicitly declined).

## Summary History (`/summary`)

- Back arrow + "Summary" title.
- **Daily | Weekly** segmented toggle.
- Scrollable vertical list; each row = date + one-line positive hook + mini
  stat (e.g. "+2.1% ▲"). Tap → opens that summary in the **same
  `DailySummaryOverlay` popup**, populated with that row's snapshot pair
  (bypassing the once-per-day gate — history is always viewable on demand).
- **Sort:** newest-first (default) or by biggest gain (surfaces best days —
  a gentle positive-spin nudge).
- **Generation from seed data:** 8 snapshots → ~7 consecutive pairs for
  **Daily** entries; **Weekly** uses wider-spaced pairs. A helper
  (e.g. `getSummaryList(cadence)`) maps snapshot pairs → summary descriptors
  (id, date, cadence, from/to snapshot). Each descriptor renders through the
  existing `computeBriefingData` + briefing prose.

## Styling (match FundsIndia)

- White / very-light background; rounded cards with soft borders.
- FundsIndia green for primary CTAs and accents.
- Fund cards: logo, star rating, investor-count badge, return %.
- "RB" avatar circle; bell icon.
- Mobile-first, single scrolling column (same frame the current build uses).

## Component map (indicative)

- `src/app/dashboard/page.tsx` — reskinned FundsIndia home.
- `src/app/summary/page.tsx` — history view.
- `src/app/settings/page.tsx` — toggle + demo reset.
- `src/components/shell/AppShell.tsx` — header (avatar/hamburger/bell) +
  sidebar drawer + mounts the DailySummary overlay; used by root layout.
- `src/components/shell/SidebarDrawer.tsx` — the real-styled nav drawer.
- `src/components/summary/DailySummaryOverlay.tsx` — popup ↔ corner-icon
  state machine + animation.
- `src/components/summary/FloatingSummaryIcon.tsx` — the corner logo trigger.
- `src/components/summary/sections/*` — the 5 section components
  (Summary, BestInvestments, ReadMore, WhatChanged, WhyItChanged), each with a
  collapse/expand dropdown.
- `src/components/summary/SummaryHistoryList.tsx` — the Daily/Weekly list.
- `src/lib/summary/useDailySummary.ts` — client hook owning open/collapsed
  state + the localStorage cadence gate.
- `src/lib/summary/summaryList.ts` — snapshot-pair → summary-descriptor
  mapping for the history view.

Reused unchanged: `src/lib/engines/*`, `src/lib/data/*`,
`src/lib/llm/*` (prompts re-tuned for tone).

## Verification

- `npm run build` + `npm run lint` clean.
- Manual flow in the preview:
  1. First open → popup drops down automatically with all 5 sections; vertical
     scroll only.
  2. X → collapses into the bottom-right circle; does not re-auto-open on
     reload same day.
  3. Tap circle → re-expands with identical content.
  4. Circle visible across `/dashboard`, `/summary`, `/settings`; hidden while
     popup open.
  5. Sidebar → Summary opens history; Daily/Weekly toggle + sort work; tapping
     a row opens that summary.
  6. Settings → toggle off hides the feature; demo reset re-triggers auto-open.
  7. Copy reads promotionally but every number traces to engine output (spot
     check: no fabricated figures).
