import Link from "next/link";
import { SummaryHistoryList } from "@/components/summary/SummaryHistoryList";

export default function SummaryPage() {
  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2">
        <Link href="/dashboard" aria-label="Back" className="text-slate-500">
          ←
        </Link>
        <h1 className="text-lg font-semibold text-slate-900">Summary</h1>
      </div>
      <SummaryHistoryList />
    </div>
  );
}
