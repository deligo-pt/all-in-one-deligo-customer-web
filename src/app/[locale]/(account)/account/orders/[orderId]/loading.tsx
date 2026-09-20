import { Skeleton } from "@/components/ui/Skeleton";
import { PageSkeleton, RowsSkeleton } from "@/components/shared/skeletons";

/** One order: the tracker, then the items beside the summary. */
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="h-9 w-72" />
      <Skeleton className="rounded-16 h-28 w-full" />
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <RowsSkeleton count={3} />
        </div>
        <Skeleton className="rounded-16 h-96 lg:w-96 lg:shrink-0" />
      </div>
    </PageSkeleton>
  );
}
