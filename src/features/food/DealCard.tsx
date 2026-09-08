import type { Deal } from "./types";

/**
 * One of a vendor's running offers.
 *
 * Measured: 280×172, 16px radius, a `line` border, 16px inside on 12px gaps;
 * the badge is a 2px-radius `brand-tint` block, the title 16/500, the body
 * 14/400 `ink-muted`, and the terms 12/400 beneath.
 *
 * Every string is the backend's. "Up to 30% OFF" and "Max discount 6€" are
 * copy the offers endpoint writes — a frontend that recomposed them from a
 * percentage and a cap would be inventing the terms of a discount, which is
 * the one thing in this application that must never be approximated.
 */
export function DealCard({ deal }: { deal: Deal }) {
  return (
    <article className="border-line rounded-16 bg-surface flex flex-col gap-3 border p-4">
      <span className="bg-brand-tint text-brand text-12 rounded-4 w-fit px-2 py-1 font-medium">
        {deal.badge}
      </span>
      <div className="flex flex-col gap-1">
        <h4 className="text-16 text-ink font-medium">{deal.title}</h4>
        <p className="text-14 text-ink-muted">{deal.description}</p>
      </div>
      {deal.terms ? <p className="text-12 text-ink-muted">{deal.terms}</p> : null}
    </article>
  );
}
