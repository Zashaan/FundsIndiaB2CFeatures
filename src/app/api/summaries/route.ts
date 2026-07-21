import { NextRequest, NextResponse } from "next/server";
import { getSummaryList } from "@/lib/summary/summaryList";
import type { SummaryCadence } from "@/lib/summary/types";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("cadence");
  const cadence: SummaryCadence = raw === "monthly" ? "monthly" : raw === "yearly" ? "yearly" : "weekly";
  return NextResponse.json({ success: true, data: getSummaryList(cadence) });
}
