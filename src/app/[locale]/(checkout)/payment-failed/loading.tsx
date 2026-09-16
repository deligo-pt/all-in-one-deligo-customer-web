import { Skeleton } from "@/components/ui/Skeleton";
import { PageSkeleton } from "@/components/shared/skeletons";

/** The failed-payment return, resetting the summary for another attempt. */
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="rounded-16 mx-auto h-80 w-full max-w-xl" />
    </PageSkeleton>
  );
}
