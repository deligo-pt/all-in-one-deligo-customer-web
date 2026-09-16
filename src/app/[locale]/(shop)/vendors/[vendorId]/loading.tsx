import { Skeleton } from "@/components/ui/Skeleton";
import { CardGridSkeleton, PageSkeleton } from "@/components/shared/skeletons";

/**
 * A restaurant's page — the slowest screen in the app (three calls: the store,
 * its products, its categories). The hero, the name block, the sticky search
 * and category rail, then the menu beside the cart panel.
 */
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="rounded-16 aspect-[1312/448] w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex flex-wrap items-center gap-12 border-b py-4">
        <Skeleton className="rounded-8 h-13 w-80" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <CardGridSkeleton count={4} className="h-40" />
        </div>
        <Skeleton className="rounded-16 h-96 lg:w-96 lg:shrink-0" />
      </div>
    </PageSkeleton>
  );
}
