import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Header, page, footer — the frame every customer-facing route sits in.
 *
 * The five route groups each mount this from their own `layout.tsx` rather than
 * it living in the locale layout, for one reason: `/tokens`, `/primitives` and
 * `/formats` are development tools and have no business wearing the product's
 * chrome. Putting the shell one level down keeps them outside it without a
 * conditional.
 *
 * `<main id="main">` is the target of the header's skip link, and it is here
 * rather than in each page so that no page can forget it.
 */
export function AppShell({
  variant,
  children,
}: {
  variant: "marketing" | "app";
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader variant={variant} />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
