import { Card, SectionHeading } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function ExplainedSimply({
  terms,
  loading,
}: {
  terms?: { term: string; explanation: string }[];
  loading: boolean;
}) {
  if (!loading && (!terms || terms.length === 0)) return null;

  return (
    <Card>
      <SectionHeading title="Explained Simply" subtitle="No jargon, just plain English." />
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ) : (
        <dl className="space-y-3">
          {terms!.map((t) => (
            <div key={t.term}>
              <dt className="text-sm font-medium text-slate-900">{t.term}</dt>
              <dd className="text-sm text-slate-500">{t.explanation}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
