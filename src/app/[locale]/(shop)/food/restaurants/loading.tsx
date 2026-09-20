import {
  CardGridSkeleton,
  DeliveryBarSkeleton,
  PageSkeleton,
} from "@/components/shared/skeletons";

/** `/food/restaurants` while the catalogue answers: the delivery card, the
 *  cuisine row, then the three-column grid the listing really draws. */
export default function Loading() {
  return (
    <PageSkeleton>
      <DeliveryBarSkeleton />
      <CardGridSkeleton count={6} />
    </PageSkeleton>
  );
}
