import { NextRequest, NextResponse } from "next/server";
import { resolveSnapshotPair } from "@/lib/session/cursor";
import { computeBriefingData } from "@/lib/engines/briefingData";
import { getAnthropicClient, BRIEFING_MODEL } from "@/lib/llm/client";
import { BRIEFING_TOOL_INPUT_SCHEMA, BriefingResponseSchema } from "@/lib/llm/schemas";
import { BRIEFING_SYSTEM_PROMPT, buildBriefingUserPrompt } from "@/lib/llm/prompts";
import { buildFallbackBriefing } from "@/lib/llm/fallback";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const pair = resolveSnapshotPair({
    from: body.from,
    to: body.to,
    cursor: body.cursor,
  });
  const data = computeBriefingData(pair);

  if (data.isFirstVisit) {
    return NextResponse.json({ success: true, data: buildFallbackBriefing(data), source: "fallback" });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ success: true, data: buildFallbackBriefing(data), source: "fallback" });
  }

  try {
    const response = await client.messages.create({
      model: BRIEFING_MODEL,
      max_tokens: 2048,
      system: BRIEFING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildBriefingUserPrompt(data) }],
      tools: [
        {
          name: "return_briefing",
          description: "Return the generated portfolio briefing prose.",
          input_schema: BRIEFING_TOOL_INPUT_SCHEMA,
        },
      ],
      tool_choice: { type: "tool", name: "return_briefing" },
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return a tool_use block");
    }

    const parsed = BriefingResponseSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      throw new Error(`Briefing response failed validation: ${parsed.error.message}`);
    }

    return NextResponse.json({ success: true, data: parsed.data, source: "llm" });
  } catch (error) {
    console.error("[/api/briefing] Falling back to deterministic briefing:", error);
    return NextResponse.json({ success: true, data: buildFallbackBriefing(data), source: "fallback" });
  }
}
