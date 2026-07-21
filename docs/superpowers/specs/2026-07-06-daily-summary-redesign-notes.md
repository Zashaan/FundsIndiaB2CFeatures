# Daily Summary Redesign — Raw Requirements (draft notes, brainstorming paused)

Status: brainstorming interrupted before approaches were presented / design approved.
Do not implement from this file directly — finish the brainstorming process
(clarifying questions → approaches → design → approval) before writing a plan.

## Context

Prior work: built "Portfolio Pulse AI", a standalone Next.js demo with a
neutral/educational tone, living at the repo root (see `README.md`,
`src/app/dashboard`). The user now wants to pivot the UI to match the real
FundsIndia app's actual look and interaction model, based on real screenshots
and hand-drawn wireframes they shared, and to shift the tone from neutral to
promotional (see "Tone shift" below).

## Reference images provided (4 photos)

1. Real FundsIndia app — left-side hamburger menu open: shows "Ritik Bansal"
   name + email header, a "View Old Dashboard" toggle, then nav rows:
   Dashboard, Mutual Funds, My Systematic Plans, Nominees, Bank Details,
   Stocks, SIF, Insights (cut off). This is the real app's existing side menu
   — a new "Summary" entry needs to be added to a menu like this.
2. Real FundsIndia app — dashboard home: "RB" avatar circle (top-left, with
   hamburger indicator) + bell/notification icon (top-right), a green
   "You're ready to invest! ... Start now" promo card, a "Products" section
   (Mutual Funds / Stocks cards), an "SIF" card, and a "Recommended Funds"
   horizontally-scrollable row with fund cards (image, investor count badge,
   name, star rating, 3y return %, cart + add buttons). This establishes the
   real app's visual language (white background, rounded cards, green CTA
   buttons, star ratings, badges) that the new summary UI should match.
3. Hand-written notebook page — the core content structure for a summary:
   - "Hey Dylan, welcome back"
   - Summary: bullet points like "NIFTY 500 saw a decrease in which means →
     [AI explanation of why, vague]" and "your investments gone up ... AI
     explanation of what happened"
   - "Best investments (today)" — a row of ~4 cards (fund logos), one
     labeled "NIFTY" showing a value like "865%"(?) and "how..." text, another
     "AXIS"
   - "Read more..." section with two expandable items: "What changed (Table)"
     and "Why it changed"
   This is called out explicitly by the user as **"what you should mainly
   do"** for each summary's content structure. Reconciled numbered list from
   the user's follow-up message:
     1. Summary
     2. Best investments
     3. A read-more description of this
     4. What changed
     5. Why it changed
4. Hand-drawn wireframes (6 phone frames) — rough app screens: a profile/menu
   screen, a "Summary" detail screen (mostly blank/placeholder), 4 more blank
   phone frames (likely other flow states not yet detailed).
5. Hand-drawn wireframes (4 phone frames):
   - "After" — mimics screenshot 2's dashboard layout (RB avatar, bell,
     promo card, Products, Recommended Funds w/ "View all").
   - "Anho" (unclear label) — a phone frame with a small "X" in the top-left
     of a large empty rounded rectangle — this looks like it could be the
     summary popup with a close/X button.
   - "Settings" — back arrow + "Settings" title, 3 toggle rows (squiggle
     placeholder labels) with checkbox/toggle states, plus a "System Summary"
     toggle row at the bottom.
   - Another dashboard-like frame with RB avatar (top-left, small pencil/edit
     mark next to it) and two circular icons top-right, and a scribbled-out
     icon on the second row (left side) — ambiguous, possibly an alternate
     header treatment or a scratched-out design idea.

## Functional requirements (from the text instructions)

1. **Frequency**: the summary popup should appear **at most once per day**
   (not every login/session — a real daily cadence gate, differs from the
   prior "Portfololio Pulse" prototype's per-session cursor mechanic).
2. **Floating icon**: a small logo/icon fixed in the bottom-right corner of
   the screen.
3. **First-open behavior**: when the app is first opened (and the daily
   summary hasn't been seen ymet), the summary appears as a dropdown/popup
   overlay automatically.
4. **Dismiss animation**: the user can "X" out of the popup. Dismissing it
   animates the popup **downward** into the small floating circle/icon
   (i.e., the popup visually collapses/shrinks down into the corner icon).
5. **Re-open**: clicking the small floating icon retrieves/reopens the daily
   summary again (same content, doesn't regenerate).
6. **Sidebar navigation**: add a **"Summary"** entry to the left-side hamburger
   menu (matching image 1's existing menu style). This opens a list/history
   view of past summaries — **daily or weekly**, sortable and scrollable
   (a history/archive, not just "today's" popup).
7. **Content structure per summary** (per image 3 / the numbered list) — in
   this order:
     1. Summary (short intro / TL;DR bullets)
     2. Best investments (today) — card row of top-performing holdings
     3. A "read more" expanded description of the summary
     4. What changed (framed as a table per the notebook sketch)
     5. Why it changed
   Each section's detail/description should be **collapsed by default with a
   dropdown to expand** ("for everything show some description but let a
   dropdown appear").
8. **Tone shift — promotional, not neutral**: "we really want to portray
   FundsIndia in a good light. We want them to invest more money and not take
   out any money." — select which facts/points to foreground so the summary
   reads as encouraging continued/increased investment and discourages
   withdrawal, while (implicitly, carried over from prior design principles)
   still not inventing numbers. This is a meaningful tone/business-direction
   change from the prior neutral, compliance-cautious framing used in the
   original Portfolio Pulse build (that build explicitly avoided any
   directive "should I invest" language) — needs to be explicitly reconciled
   with the user during brainstorming since it may conflict with the
   "educational only, never directive" guardrails built earlier.
9. **Scroll behavior**: the main popup summary screen (the one that appears
   first) should be **vertically scrollable only** — no horizontal/left-right
   swipe navigation between sections.
10. **Floating icon scope — delegated decision**: user explicitly asked me to
    decide whether the small floating circle icon should persist through the
    **entire app** or **just the dashboard**. Open decision for brainstorming.
11. **Data source**: "We have a database of data we can connect to code" —
    implies a real (or more real) data source may now be available, distinct
    from the fully-synthetic seed data used in the prior build. Needs
    clarification: is this Convex/Postgres/something else, is it ready now or
    aspirational, and should the new UI be built against the existing
    `repository.ts` abstraction (already designed as the swap boundary) or
    does the schema need to change to match a real schema they'll provide?

## Where things stand

- Visual companion (browser-based mockup tool) was offered and accepted by
  the user, but the server start command was rejected before it launched —
  the user said "save what you have for later" instead of proceeding.
- Brainstorming had NOT yet reached: clarifying questions, proposed
  approaches, or a presented design. All of that still needs to happen before
  writing an implementation plan.
- Existing code this will build on/replace: `src/app/dashboard/page.tsx`,
  `src/components/BriefingSections.tsx` and its children, `src/lib/engines/*`,
  `src/lib/llm/*`, `src/lib/data/repository.ts` (the intended real-data swap
  boundary), `src/lib/session/cursor.ts` (per-session cursor — likely needs
  to become a per-day gate instead, see requirement 1).

## Open questions to resume with (not yet asked)

- Tone shift vs. existing "never directive, educational only" guardrails in
  `src/lib/llm/prompts.ts` — how far to push "encourage more investment,
  discourage withdrawal" while staying compliance-safe / non-manipulative.
- What "database of data we can connect to code" actually refers to (system,
  availability, schema).
- Floating icon scope (entire app vs. dashboard-only) — user delegated this,
  still needs a recommendation + confirmation.
- Whether "daily or weekly summaries" in the sidebar list are two separate
  cadences the user picks between, or one combined chronological list.
- Exact visual styling to match the real app (colors/fonts weren't
  extracted from the screenshots yet — would need the visual companion or
  more explicit palette/typography questions).
