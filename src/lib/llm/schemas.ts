import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";

export const MoverReasonSchema = z.object({
  fundId: z.string(),
  reason: z.string(),
});

export const AttributionExplanationSchema = z.object({
  category: z.string(),
  explanation: z.string(),
});

export const JargonTermSchema = z.object({
  term: z.string(),
  explanation: z.string(),
});

export const OpportunityNudgeSchema = z.object({
  type: z.string(),
  nudge: z.string(),
});

export const BriefingResponseSchema = z.object({
  moversReasons: z.array(MoverReasonSchema),
  attributionExplanations: z.array(AttributionExplanationSchema),
  jargonTerms: z.array(JargonTermSchema),
  shortSummary: z.string(),
  insightsSummary: z.array(z.string()),
  opportunityNudges: z.array(OpportunityNudgeSchema),
  concernNarrative: z.string(),
});

export type BriefingResponse = z.infer<typeof BriefingResponseSchema>;

// Hand-authored JSON Schema mirroring BriefingResponseSchema, used as the
// Claude tool's input_schema so the model is forced to return this exact shape.
export const BRIEFING_TOOL_INPUT_SCHEMA: Anthropic.Tool.InputSchema = {
  type: "object",
  properties: {
    moversReasons: {
      type: "array",
      items: {
        type: "object",
        properties: {
          fundId: { type: "string" },
          reason: { type: "string" },
        },
        required: ["fundId", "reason"],
      },
    },
    attributionExplanations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["category", "explanation"],
      },
    },
    jargonTerms: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["term", "explanation"],
      },
    },
    shortSummary: { type: "string" },
    insightsSummary: { type: "array", items: { type: "string" } },
    opportunityNudges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          nudge: { type: "string" },
        },
        required: ["type", "nudge"],
      },
    },
    concernNarrative: { type: "string" },
  },
  required: [
    "moversReasons",
    "attributionExplanations",
    "jargonTerms",
    "shortSummary",
    "insightsSummary",
    "opportunityNudges",
    "concernNarrative",
  ],
};
