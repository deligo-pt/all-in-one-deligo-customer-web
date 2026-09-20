import { Skeleton } from "@/components/ui/Skeleton";
import { PageSkeleton } from "@/components/shared/skeletons";

/** The profile: the card, the stat tiles, then the two columns of rows. */
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="rounded-16 h-40 w-full" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="rounded-16 h-24" />
        <Skeleton className="rounded-16 h-24" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="rounded-16 h-72" />
        <Skeleton className="rounded-16 h-72" />
      </div>
    </PageSkeleton>
  );
}
