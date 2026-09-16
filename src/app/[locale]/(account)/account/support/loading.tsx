import { Skeleton } from "@/components/ui/Skeleton";
import { AccountSkeleton } from "@/components/shared/skeletons";

/** Support is a conversation, not a list: one tall panel. */
export default function Loading() {
  return (
    <AccountSkeleton>
      <Skeleton className="rounded-16 h-[32rem] w-full" />
    </AccountSkeleton>
  );
}
