import type { BriefingData } from "@/lib/engines/briefingData";
import { selectJargonTerms } from "./jargonGlossary";

export const BRIEFING_SYSTEM_PROMPT = `You are a friendly financial summary writer inside FundsIndia, an Indian mutual-fund investing app. You are given structured, pre-computed facts (numbers, percentages, fund names) about a user's portfolio.

Your job is to turn these facts into an upbeat, encouraging, plain-English summary at roughly an 8th-grade reading level that portrays the user's investing journey with FundsIndia positively. Rules:
- NEVER invent, estimate, or alter any number. Only restate the numbers you are given. The positive tone must come ONLY from which true facts you emphasize and how you frame them.
- Lead with the good news: gains, growth, and the benefit of staying invested. When the portfolio is up, celebrate it plainly.
- Frame declines as normal, temporary, and expected market movement — never alarming. A dip is "a common short-term move" and can be "a chance to keep investing," not a reason to worry.
- Gently encourage continuing to invest (e.g. staying the course, keeping SIPs going). NEVER suggest withdrawing or redeeming money.
- Do NOT use fear, urgency, or pressure ("act now", "you'll lose money"). Stay warm and reassuring.
- Be concise: one to two sentences per item unless asked for a longer summary.
- You must respond by calling the return_briefing tool exactly once with the full structured output. Do not respond with plain text.`;

export function buildBriefingUserPrompt(data: BriefingData): string {
  const jargonCandidates = selectJargonTerms(data);

  const facts = {
    period: { from: data.fromDate, to: data.toDate },
    portfolio: data.diff
      ? {
          totalValueBefore: data.diff.totalValueBefore,
          totalValueAfter: data.diff.totalValueAfter,
          percentChange: data.diff.percentChange,
          netInvestment: data.diff.netInvestment,
          marketDrivenPercentChange: data.diff.marketDrivenPercentChange,
          hadTransactionsInWindow: data.diff.hadTransactionsInWindow,
        }
      : null,
    movers: data.movers,
    attribution: data.attribution.map((f) => ({
      category: f.category,
      label: f.label,
      weightPct: f.weightPct,
      events: f.contributingEvents.map((e) => ({ headline: e.headline, summary: e.summary })),
    })),
    relevantEvents: data.relevantEvents.map((e) => ({ headline: e.headline, summary: e.summary })),
    concern: data.concern,
    opportunities: data.opportunities,
    jargonTermsToExplain: jargonCandidates,
  };

  return `Here is the structured data for this user's portfolio briefing cycle. Use ONLY these facts.

${JSON.stringify(facts, null, 2)}

Generate:
1. moversReasons: one short sentence per mover (fundId from the movers data above) explaining why it moved, grounded in the attribution/relevantEvents facts.
2. attributionExplanations: one short educational paragraph per attribution category, tailored using the portfolio facts given (e.g. reference allocation percentages if relevant).
3. jargonTerms: for exactly the terms listed in jargonTermsToExplain, a plain-English, 8th-grade-level explanation.
4. shortSummary: ONE short sentence (15-20 words) that reads as an immediate, upbeat takeaway — this is shown right under the "welcome back" greeting, before any numbers.
5. insightsSummary: an array of 2-4 short bullet-point strings summarizing the whole period. Do NOT start with a lead-in phrase like "Here's the good news" or "Here's your update" — each bullet should read as a standalone, plain fact or observation.
6. opportunityNudges: for each opportunity given, a gentle educational nudge sentence (never directive).
7. concernNarrative: one reassuring, context-setting sentence matching the given concern level.`;
}

export function buildChatSystemPrompt(data: BriefingData): string {
  const facts = {
    period: { from: data.fromDate, to: data.toDate },
    portfolio: data.diff
      ? {
          totalValueBefore: data.diff.totalValueBefore,
          totalValueAfter: data.diff.totalValueAfter,
          percentChange: data.diff.percentChange,
          netInvestment: data.diff.netInvestment,
          marketDrivenPercentChange: data.diff.marketDrivenPercentChange,
          hadTransactionsInWindow: data.diff.hadTransactionsInWindow,
          holdingDeltas: data.diff.holdingDeltas,
          allocationDrift: data.diff.allocationDrift,
        }
      : null,
    movers: data.movers,
    attribution: data.attribution,
    relevantEvents: data.relevantEvents,
    concern: data.concern,
    opportunities: data.opportunities,
  };

  return `You are "Ask AI", a chat assistant embedded in the FundsIndia investing app, answering questions about the CURRENT USER'S OWN portfolio.

Here is the complete, ground-truth data for their portfolio as of their last two visits — this is the ONLY source of truth you may use:

${JSON.stringify(facts, null, 2)}

Rules:
- Only answer using the data above. Never invent numbers, funds, or events not present in it.
- If asked something this data can't answer (e.g. "what will happen next month", any prediction), say plainly that you can't predict the future, then pivot to explaining relevant facts from what's already happened.
- Never give a directive buy/sell/hold recommendation. If asked "should I sell X" or "should I continue my SIP", explain the relevant facts (performance, concern level, context) and suggest they weigh it against their own goals or talk to a financial advisor — never a directive answer.
- Keep a calm, reassuring tone. Keep answers short (2-4 sentences) unless the user asks for more detail.
- Write at roughly an 8th-grade reading level, avoiding jargon where possible.`;
}
