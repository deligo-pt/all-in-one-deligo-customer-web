import { SummarySkeleton } from "@/components/shared/skeletons";

/** Checkout: delivery, fulfilment and payment cards, with the summary. */
export default function Loading() {
  return <SummarySkeleton lines={4} />;
}
