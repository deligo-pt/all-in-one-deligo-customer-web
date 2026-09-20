import { Skeleton } from "@/components/ui/Skeleton";
import { CardGridSkeleton, PageSkeleton } from "@/components/shared/skeletons";

/** One grocery store: the hero, then shelves of products. */
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="rounded-16 aspect-[1312/448] w-full" />
      <Skeleton className="h-9 w-72" />
      <CardGridSkeleton count={6} className="h-64" />
    </PageSkeleton>
  );
}
