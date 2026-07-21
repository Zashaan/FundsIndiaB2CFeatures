import { NextRequest, NextResponse } from "next/server";
import { resolveSnapshotPair } from "@/lib/session/cursor";
import { computeBriefingData } from "@/lib/engines/briefingData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pair = resolveSnapshotPair({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
  });

  const data = computeBriefingData(pair);
  return NextResponse.json({ success: true, data });
}
