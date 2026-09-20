import { Skeleton } from "@/components/ui/Skeleton";
import { PageSkeleton } from "@/components/shared/skeletons";

/**
 * The vertical's front door while we work out whether the customer already has
 * a delivery location (Phase 20n made this page read one): the hero's headline
 * block and its address bar.
 *
 * Usually this is a flash on the way to the listing — a customer we can place
 * is redirected there — which is exactly why it must not be a blank screen.
 */
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="rounded-24 h-96 w-full" />
      <Skeleton className="rounded-16 h-16 w-full max-w-xl" />
    </PageSkeleton>
  );
}
