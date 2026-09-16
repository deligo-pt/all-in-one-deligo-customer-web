import { SummarySkeleton } from "@/components/shared/skeletons";

/** The cart: its lines, and the summary column beside them. */
export default function Loading() {
  return <SummarySkeleton lines={3} />;
}
