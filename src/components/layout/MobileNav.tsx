"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * The drawer is loaded when the menu is first opened, not when the page is.
 *
 * It is the single most expensive thing in the app shell — a focus trap, an
 * inert background and a portal — and on a desktop viewport it is never
 * rendered at all. Every route was paying for it on first load; measured, this
 * is the difference between a placeholder page at 93% of the budget and one
 * comfortably under it.
 */
const Drawer = dynamic(() => import("@/components/ui/Drawer").then((m) => m.Drawer), {
  ssr: false,
});

/**
 * The navigation, below the width the design was drawn at.
 *
 * **This has no source in Figma.** Every frame in the file is 1440px wide;
 * there is no mobile or tablet design at all. The desktop header lays six
 * vertical links, a search field and two buttons across 1312px, and none of
 * that fits on a phone. So the collapse is invented, and it is invented in one
 * place rather than guessed at again on every screen: below `lg` the links move
 * into this drawer, and the header keeps the logo, the cart and this button.
 *
 * Recorded as a decision in Plan.md rather than presented as a measurement.
 */
export function MobileNav({
  links,
  openLabel,
  title,
  closeLabel,
}: {
  links: ReadonlyArray<{ href: string; path: string; label: string }>;
  openLabel: string;
  title: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={openLabel}
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        <Icon name="chevron-down" />
      </Button>

      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="start"
        title={title}
        closeLabel={closeLabel}
      >
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-16 text-ink hover:bg-surface-muted rounded-8 block px-3 py-3 font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Drawer>
    </>
  );
}
