"use client";

import { useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

/**
 * The testimonial row.
 *
 * The design draws it as a marquee — the nine cards repeat, implying they
 * scroll on their own. They do not here, and that is a deliberate change: text
 * that moves while somebody is reading it cannot be read, the design offers no
 * pause control, and an auto-advancing region is one of the few patterns that
 * fails for sighted and screen-reader users at the same time. Instead the row
 * scrolls, snaps, and has two buttons.
 *
 * The scroller is `tabIndex={0}` with a name and `aria-roledescription`, so it
 * is reachable by keyboard and announced as what it is. Arrow keys scroll it
 * because the browser does that for a focusable scroll container — nothing here
 * reimplements it.
 */
export function TestimonialsCarousel({
  items,
  label,
  previousLabel,
  nextLabel,
}: {
  items: ReadonlyArray<{
    name: string;
    initials: string;
    region: string;
    quote: string;
    date: string;
    verified: string;
  }>;
  label: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const scroller = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6">
      <ul
        ref={scroller}
        tabIndex={0}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
      >
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="w-80 shrink-0 snap-start">
            <Card className="h-full">
              <CardBody className="flex h-full flex-col gap-3 p-6">
                {/* Initials, not a photograph. The design attaches a face to
                    each testimonial; nine faces belonging to people who may not
                    have said these things is the part of D-9 that is hardest to
                    take back. The initials keep the layout and claim nothing. */}
                <div className="flex items-center gap-3">
                  <Avatar
                    alt={item.name}
                    fallback={item.initials}
                    className="size-10"
                  />
                  <div className="flex flex-col">
                    <span className="text-16 text-ink-strong font-medium">
                      {item.name}
                    </span>
                    <span className="text-12 text-ink-muted">{item.region}</span>
                  </div>
                </div>
                <blockquote className="text-16 text-ink-strong flex-1 leading-relaxed">
                  {item.quote}
                </blockquote>
                <div className="text-12 text-ink-muted flex items-center justify-between gap-2">
                  <span>{item.verified}</span>
                  <span>{item.date}</span>
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={previousLabel}
          onClick={() => scrollBy(-1)}
        >
          <Icon name="chevron-left" className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={nextLabel}
          onClick={() => scrollBy(1)}
        >
          <Icon name="chevron-right" className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
