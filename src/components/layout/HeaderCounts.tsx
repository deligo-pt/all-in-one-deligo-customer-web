"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CART_EVENT, PUSH_EVENT } from "@/lib/events";
import { hasSession } from "@/services/session/state";

type Counts = { unread: number; cartItems: number };

const badge = (count: number) => (count > 9 ? "9+" : String(count));

/**
 * The header's notification bell and cart, with the counts the old app's
 * navbar showed: unread notifications and items in the cart.
 *
 * Read after the page is up, only for a signed-in browser, and again on every
 * navigation — never on the server, so no page waits for two extra requests.
 * The counts are the API's (`/carts/view-cart` `totalQuantity`, and the unread
 * rows of `/notifications/my-notifications`); nothing is kept locally.
 */
export function HeaderCounts({
  notificationsHref,
  cartHref,
  notificationsLabel,
  cartLabel,
}: {
  notificationsHref: string;
  cartHref: string;
  notificationsLabel: string;
  cartLabel: string;
}) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Counts>({ unread: 0, cartItems: 0 });
  /**
   * Bumped by anything that changes what these badges count, so they follow
   * the action that caused it instead of waiting for the next navigation: a
   * push (Phase 20g) and a cart write (Phase 20g fix — adding a dish happens
   * on the page you are already on, so the path never changes and the bell
   * and basket stayed a step behind until a reload).
   */
  const [changes, setChanges] = useState(0);

  useEffect(() => {
    const bump = () => setChanges((count) => count + 1);
    window.addEventListener(PUSH_EVENT, bump);
    window.addEventListener(CART_EVENT, bump);
    return () => {
      window.removeEventListener(PUSH_EVENT, bump);
      window.removeEventListener(CART_EVENT, bump);
    };
  }, []);

  useEffect(() => {
    if (!hasSession()) return;
    let cancelled = false;
    void import("@/services/session/browser").then(async ({ browserApi }) => {
      const api = browserApi();
      const [cart, notifications] = await Promise.allSettled([
        api.get("/carts/view-cart"),
        api.get("/notifications/my-notifications", { params: { limit: 100 } }),
      ]);
      if (cancelled) return;
      const cartItems =
        cart.status === "fulfilled"
          ? Number(cart.value.data?.data?.totalQuantity ?? 0)
          : 0;
      const rows: { isRead?: boolean }[] =
        notifications.status === "fulfilled" &&
        Array.isArray(notifications.value.data?.data)
          ? notifications.value.data.data
          : [];
      setCounts({ cartItems, unread: rows.filter((row) => !row.isRead).length });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, changes]);

  const link = (
    href: string,
    label: string,
    icon: "notification" | "cart",
    count: number,
  ) => (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="text-ink hover:bg-surface-muted rounded-8 relative inline-flex size-10 items-center justify-center transition-colors"
    >
      <Icon name={icon} className="size-6" />
      {count > 0 ? (
        <span
          aria-hidden
          className="bg-brand text-ink-inverse text-10 absolute -end-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full px-1 leading-4 font-semibold"
        >
          {badge(count)}
        </span>
      ) : null}
    </Link>
  );

  return (
    <>
      {link(notificationsHref, notificationsLabel, "notification", counts.unread)}
      {link(cartHref, cartLabel, "cart", counts.cartItems)}
    </>
  );
}
