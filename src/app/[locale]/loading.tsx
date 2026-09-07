import { Skeleton } from "@/components/ui/Skeleton";

/**
 * The shape of a page while it is being fetched.
 *
 * Deliberately generic and deliberately quiet: skeletons are `aria-hidden`, and
 * the navigation itself is what tells a screen-reader user that something is
 * happening. A route with a distinctive layout can add its own `loading.tsx`
 * next to its page; this is the floor, so that no route falls back to a blank
 * screen.
 */
export default function Loading() {
  return (
    <main id="main" className="max-w-shell mx-auto w-full flex-1 space-y-6 px-8 py-12">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    </main>
  );
}
