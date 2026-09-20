import { Skeleton } from "@/components/ui/Skeleton";
import {
  CardGridSkeleton,
  HeadingSkeleton,
  PageSkeleton,
} from "@/components/shared/skeletons";

/** `/search` — the heading, the filter bar, then the results grid. */
export default function Loading() {
  return (
    <PageSkeleton>
      <HeadingSkeleton />
      <Skeleton className="rounded-16 h-24 w-full" />
      <CardGridSkeleton count={6} className="h-32" />
    </PageSkeleton>
  );
}
