"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
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
 * place rather than guessed at again on every screen: below `xl` the links move
 * into this drawer, and the header keeps the logo, the cart and this button.
 *
 * **Below `xl`, not `lg`.** Measured (Phase 20 responsive pass): the full bar
 * needs about 1,380px, so between 1024 and 1366px — ordinary laptops — it ran
 * past the screen and every page scrolled sideways. The header now sheds items
 * as it narrows (see `SiteHeader`), and whatever it sheds is here: `children`
 * carries search, sign-in, language and the app link, so a phone loses nothing
 * but the room they took. Before this, a phone had no way to sign in from the
 * header at all.
 *
 * Recorded as a decision in Plan.md rather than presented as a measurement.
 */
export function MobileNav({
  links,
  openLabel,
  title,
  closeLabel,
  children,
}: {
  links: ReadonlyArray<{ href: string; path: string; label: string }>;
  openLabel: string;
  title: string;
  closeLabel: string;
  /** What the header drops as it narrows — shown under the links. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={openLabel}
        onClick={() => setOpen(true)}
        className="xl:hidden"
      >
        {/* ☰, not ⌄: on a phone a chevron reads as "expand this", not as
            the menu (owner's screenshot, 22 Sep 2026). */}
        <Icon name="menu" />
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
        {children ? (
          <div className="border-line mt-4 flex flex-col gap-4 border-t pt-4">
            {children}
          </div>
        ) : null}
      </Drawer>
    </>
  );
}
