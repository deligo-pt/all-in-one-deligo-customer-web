import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Header, page, footer — the frame every customer-facing route sits in.
 *
 * The six route groups each mount this from their own `layout.tsx` rather than
 * it living in the locale layout, for one reason: `/tokens`, `/primitives` and
 * `/formats` are development tools and have no business wearing the product's
 * chrome. Putting the shell one level down keeps them outside it without a
 * conditional.
 *
 * `<main id="main">` is the target of the header's skip link, and it is here
 * rather than in each page so that no page can forget it.
 *
 * `auth` is the third variant and the only one that drops the footer. A
 * sign-in screen is a task with one exit, and a footer under it is forty links
 * away from finishing it — the previous app's login page had no chrome at all
 * for the same reason. What stays is the mark, the language control, the skip
 * link and the landmark, because leaving *those* out is how a screen becomes
 * unreachable rather than uncluttered.
 */
export function AppShell({
  variant,
  children,
}: {
  variant: "marketing" | "app" | "auth";
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader variant={variant} />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      {variant === "auth" ? null : <SiteFooter />}
    </>
  );
}
