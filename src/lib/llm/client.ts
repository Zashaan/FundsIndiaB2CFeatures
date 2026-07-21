// Server-only Anthropic client. Never import this from a client component —
// it reads ANTHROPIC_API_KEY, which must stay off the client bundle.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const BRIEFING_MODEL = "claude-sonnet-5";
export const CHAT_MODEL = "claude-sonnet-5";

let cachedClient: Anthropic | null = null;

/** Returns null (rather than throwing) when no API key is configured, so callers can fall back gracefully. */
export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!cachedClient) cachedClient = new Anthropic();
  return cachedClient;
}
