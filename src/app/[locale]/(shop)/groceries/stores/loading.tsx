import {
  CardGridSkeleton,
  DeliveryBarSkeleton,
  PageSkeleton,
} from "@/components/shared/skeletons";

/** `/groceries/stores` — the food listing's frame, as the real page is. */
export default function Loading() {
  return (
    <PageSkeleton>
      <DeliveryBarSkeleton />
      <CardGridSkeleton count={6} />
    </PageSkeleton>
  );
}
