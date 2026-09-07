"use client";

import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Icon } from "./Icon";

/**
 * Page navigation. Presentational: it is told the current page and the total,
 * and reports a change. It never owns the number.
 *
 * Wrapped in a `<nav>` with a name, and the current page carries
 * `aria-current="page"` — without it every page button sounds identical and the
 * only way to tell where you are is to see the highlight.
 *
 * Long ranges collapse to first · … · neighbours · … · last. The ellipsis is a
 * `<span>`, not a disabled button: there is nothing there to press.
 */
function pageWindow(page: number, count: number): Array<number | "gap"> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((p) => p > 1 && p < count);
  const out: Array<number | "gap"> = [1];
  if ((around[0] ?? count) > 2) out.push("gap");
  out.push(...around);
  if ((around.at(-1) ?? 1) < count - 1) out.push("gap");
  out.push(count);
  return out;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label,
  previousLabel,
  nextLabel,
  pageLabel,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Accessible name for the navigation region — "Pagination". */
  label: string;
  previousLabel: string;
  nextLabel: string;
  /** Builds each page button's accessible name — `(n) => \`Page ${n}\``. */
  pageLabel: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={previousLabel}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Icon name="chevron-left" className="size-4 rtl:rotate-180" />
      </Button>

      {pageWindow(page, pageCount).map((entry, i) =>
        entry === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="text-ink-subtle px-1">
            …
          </span>
        ) : (
          <Button
            key={entry}
            variant={entry === page ? "primary" : "ghost"}
            size="icon-sm"
            aria-label={pageLabel(entry)}
            aria-current={entry === page ? "page" : undefined}
            onClick={() => onPageChange(entry)}
          >
            {entry}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={nextLabel}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <Icon name="chevron-right" className="size-4 rtl:rotate-180" />
      </Button>
    </nav>
  );
}
