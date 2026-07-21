# FundsIndia B2C Features

A mobile-first FundsIndia prototype focused on guided investing features for mass affluent mutual fund investors.

The current feature slice is **Advisor Calls**: a scheduling and meeting-prep flow that helps investors request guidance, explain what they need, generate advisor context, choose an advisor, pick a time, and review previous call summaries.

## Current Prototype

The app opens to:

```text
/advisor-calls
```

The Advisor Calls flow includes:

- Advisor Calls home screen
- Suggested reason to speak with an advisor
- Upcoming call card
- Previous conversation memory
- Topic selection
- Investor context note
- AI-style advisor brief
- Advisor selection
- Time slot selection
- Calendar connection state
- Booking review
- Scheduled call confirmation
- Past call summary detail

## Why This Exists

The product direction is based on the idea that mass affluent investors do not only need more investing tools. They need confidence, trust, and clear guidance before making financial decisions.

This prototype explores how FundsIndia could make advisor access feel:

- easy to find
- emotionally reassuring
- context-aware
- useful for both investor and advisor
- connected to goals, SIPs, and prior conversations

## Project Backbone

This repo was bootstrapped from an earlier FundsIndia AI-summary prototype so it could reuse the existing mobile app shell, seeded portfolio data, styling conventions, and Next.js structure.

The older dashboard and summary routes still exist as supporting backbone screens, but the active feature focus is Advisor Calls.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Seeded demo data

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
http://localhost:3000/advisor-calls
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
src/app/advisor-calls/page.tsx
src/components/advisor/AdvisorCallsApp.tsx
src/components/shell/AppShell.tsx
src/components/shell/SidebarDrawer.tsx
src/app/page.tsx
```

The static design references from the earlier design phase are in:

```text
outputs/
```

## Notes

This is a prototype. It does not connect to real FundsIndia accounts, advisor calendars, mutual fund transactions, or production user data.

The advisor brief and calendar behavior are mocked to demonstrate the intended product experience.
