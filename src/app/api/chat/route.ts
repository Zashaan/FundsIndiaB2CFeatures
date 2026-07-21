import { NextRequest } from "next/server";
import { resolveSnapshotPair } from "@/lib/session/cursor";
import { computeBriefingData } from "@/lib/engines/briefingData";
import { getAnthropicClient, CHAT_MODEL } from "@/lib/llm/client";
import { buildChatSystemPrompt } from "@/lib/llm/prompts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const NO_KEY_FALLBACK =
  "I can't reach the AI service right now (no ANTHROPIC_API_KEY is configured for this demo), so I can't answer free-form questions. Try setting the key locally, or check the deterministic sections above — the numbers there are always accurate.";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message: string = body.message ?? "";
  const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

  const pair = resolveSnapshotPair({ from: body.from, to: body.to, cursor: body.cursor });
  const data = computeBriefingData(pair);

  const client = getAnthropicClient();
  if (!client) {
    return new Response(NO_KEY_FALLBACK, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const systemPrompt = buildChatSystemPrompt(data);
  const encoder = new TextEncoder();

  try {
    const stream = client.messages.stream({
      model: CHAT_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...history.map((m) => ({ role: m.role, content: m.content })), { role: "user" as const, content: message }],
    });

    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        stream.on("text", (text) => controller.enqueue(encoder.encode(text)));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => {
          console.error("[/api/chat] stream error:", err);
          controller.error(err);
        });
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (error) {
    console.error("[/api/chat] Falling back:", error);
    return new Response(
      "Sorry, I ran into an error answering that. Please try again in a moment.",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
