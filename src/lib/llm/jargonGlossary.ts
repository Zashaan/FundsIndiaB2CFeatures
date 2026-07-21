import type { BriefingData } from "@/lib/engines/briefingData";

// Canned, portfolio-independent definitions. Used verbatim when the LLM is
// unavailable, and as the candidate list the LLM picks from + rephrases.
export const JARGON_GLOSSARY: Record<string, string> = {
  NAV: "NAV stands for Net Asset Value. It's the price of one unit of a mutual fund, worked out at the end of each trading day.",
  SIP: "SIP stands for Systematic Investment Plan. It means investing a fixed amount regularly, like every month, instead of all at once.",
  "Asset Allocation":
    "Asset allocation is how your money is split across different types of investments, like stocks, bonds, and gold.",
  "Expense Ratio":
    "The expense ratio is the small yearly fee a fund charges to manage your money, shown as a percentage.",
  "Repo Rate":
    "The repo rate is the interest rate at which the central bank lends to other banks. When it changes, loan and deposit rates often follow.",
  Drawdown: "A drawdown is how much an investment has fallen from its most recent high point.",
  Diversification:
    "Diversification means spreading your money across different types of investments, so one bad performer doesn't hurt your whole portfolio.",
};

/** Which glossary terms are relevant this cycle, chosen deterministically from engine facts. */
export function selectJargonTerms(data: BriefingData): string[] {
  const terms = new Set<string>(["NAV", "SIP", "Asset Allocation", "Expense Ratio"]);

  if (data.relevantEvents.some((e) => e.category === "rate_expectations")) {
    terms.add("Repo Rate");
  }
  if (data.concern && data.concern.level !== "green") {
    terms.add("Drawdown");
  }
  if (data.opportunities.some((o) => o.type === "low_international_diversification")) {
    terms.add("Diversification");
  }

  return Array.from(terms);
}
