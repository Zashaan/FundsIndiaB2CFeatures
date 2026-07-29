# FundsIndia B2C Features

A mobile-first FundsIndia prototype for mass affluent mutual fund investors.

The app explores how FundsIndia could build trust and confidence through goals, advisor access, fund discovery, portfolio guidance, and family-oriented investing workflows.

## Current Prototype

The app currently includes these primary surfaces:

- **Home** (`/dashboard`) - portfolio confidence dashboard with allocation guardrails, next best actions, trusted guidance routing, income-aware SIP suggestions, advisor prompts, and fund review cards.
- **Funds** (`/funds`) - mutual fund research desk with risk labels, expense ratios, use-case guidance, comparison actions, SIP CTAs, advisor-reviewed shortlists, and transfer-in concierge concept.
- **Goals** (`/goals`) - goal planning dashboard with active/past goals, collaborative contributor flows, goal creation, portfolio value line charts, progress indicators, advisor handoff, and redemption tax/exit-load guidance.
- **Advisor Calls** (`/advisor-calls`) - calm advisory scheduling flow with reason capture, advisor context, calendar-based time suggestions, previous discussion memory, and advisor briefing.
- **Summary** (`/summary`) - inherited AI portfolio summary surface from the original prototype backbone.
- **Settings** (`/settings`) - basic settings surface.

## Product Direction

This prototype is based on the idea that mass affluent investors do not only need transaction tools. They need reassurance, reliable guidance, and a product that makes investing feel understandable and safe.

The current build focuses on:

- confidence instead of feature clutter
- goal-based mutual fund investing
- human advisor access
- context-aware AI guidance
- collaborative family/couple investing
- clearer fund selection
- tax and redemption clarity
- easier transfer of external assets into FundsIndia

## Implemented Feature Ideas

From the mass affluent product proposal, the prototype now covers:

- Easy advisor call scheduling
- Previous call summaries and discussion history
- AI-style context capture before advisor calls
- Calendar-aware suggested time slots
- Collaborative goals for couples/families
- SIP uplift suggestions when income changes
- Trusted-answer routing before escalating to an advisor call
- Goal redemption tax and exit-load guidance
- Transfer-in concierge concept for external assets
- Better Home and Funds pages for investor confidence

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Seeded demo portfolio/fund data

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/dashboard
```

Build for production:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

## Useful Scripts

```bash
npm run lint
npm run build
npm run test
npm run seed
```

## Important Files

```text
src/app/dashboard/page.tsx
src/app/funds/page.tsx
src/app/goals/page.tsx
src/app/advisor-calls/page.tsx
src/components/dashboard/FundsIndiaHome.tsx
src/components/funds/FundsExplorer.tsx
src/components/goals/GoalsApp.tsx
src/components/advisor/AdvisorCallsApp.tsx
src/components/shell/AppShell.tsx
src/components/shell/SidebarDrawer.tsx
```

## Notes

This is a prototype. It does not connect to real FundsIndia accounts, advisor calendars, bank accounts, income data, mutual fund transactions, tax systems, or production user data.

All portfolio, fund, SIP, advisor, transfer, and tax guidance behavior is mocked to demonstrate the intended product experience.
