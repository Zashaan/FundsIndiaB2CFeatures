import { Card, SectionHeading } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function AIInsights({ summary, loading }: { summary?: string | string[]; loading: boolean }) {
  if (!loading && (!summary || summary.length === 0)) return null;

  return (
    <Card className="bg-indigo-50/60">
      <SectionHeading title="AI Insights" />
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : Array.isArray(summary) ? (
        <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-700">
          {summary.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-slate-700">&ldquo;{summary}&rdquo;</p>
      )}
    </Card>
  );
}
