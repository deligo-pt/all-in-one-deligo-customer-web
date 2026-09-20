import { Skeleton } from "@/components/ui/Skeleton";
import { PageSkeleton } from "@/components/shared/skeletons";

/**
 * The return from the payment gateway, where our server is finishing the
 * order. It is the one wait in the app a customer must not read as a failure,
 * so the shape is the outcome card itself rather than a page of rows.
 */
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="rounded-16 mx-auto h-80 w-full max-w-xl" />
    </PageSkeleton>
  );
}
