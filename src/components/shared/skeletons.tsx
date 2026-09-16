import { Skeleton } from "@/components/ui/Skeleton";

/**
 * The shapes a page wears while its data is in flight (Phase 20m).
 *
 * **Why this exists at all.** Every screen that reads the API is a server
 * component, so a click used to leave the *old* page on screen until the
 * server had finished — measured at 951ms on a production build, with nothing
 * happening in between. Next paints a `loading.tsx` the instant the navigation
 * starts, so these are the pieces those files are built from.
 *
 * **Shaped, not generic.** A grey rectangle that turns into a very different
 * layout is its own kind of jolt, so each piece mirrors the real thing's
 * geometry — the listing's three columns, the vendor's hero, the account
 * frame's rail. Getting the proportions roughly right is the whole job.
 *
 * Every piece is `aria-hidden` (through `Skeleton`) under a container marked
 * `aria-busy`: a screen reader is told the page is loading once, not told
 * about twelve grey rectangles.
 */
export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main"
      aria-busy="true"
      className="max-w-shell mx-auto flex w-full flex-1 flex-col gap-8 px-8 py-8"
    >
      {children}
    </main>
  );
}

/** "Delivering to …" — the card every listing opens with. */
export function DeliveryBarSkeleton() {
  return <Skeleton className="rounded-16 h-20 w-full" />;
}

/** A title and a line under it. */
export function HeadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96 max-w-full" />
    </div>
  );
}

/** The store and dish grids: three columns at desktop width. */
export function CardGridSkeleton({
  count = 6,
  className = "h-72",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={`rounded-16 w-full ${className}`} />
      ))}
    </div>
  );
}

/** Stacked rows — orders, addresses, cards, vouchers, notifications. */
export function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="rounded-16 h-28 w-full" />
      ))}
    </div>
  );
}

/** The account frame: the menu rail beside the screen's own content. */
export function AccountSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <PageSkeleton>
      <HeadingSkeleton />
      <div className="flex flex-col gap-8 lg:flex-row">
        <Skeleton className="rounded-16 h-96 lg:w-72 lg:shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {children ?? <RowsSkeleton />}
        </div>
      </div>
    </PageSkeleton>
  );
}

/** A summary column beside the main one — the cart and the checkout. */
export function SummarySkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <PageSkeleton>
      <HeadingSkeleton />
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <RowsSkeleton count={lines} />
        </div>
        <Skeleton className="rounded-16 h-96 lg:w-96 lg:shrink-0" />
      </div>
    </PageSkeleton>
  );
}
