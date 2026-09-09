import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import type { AccountNavItem } from "./AccountShell";

/**
 * The account menu, built from the route map rather than typed out.
 *
 * Six destinations and one of them is `/account/orders`, which Phase 11 owns —
 * the menu is where a customer looks for it, and a second hand-written path
 * here is one that loses its locale prefix or rots when a route moves.
 */
/** Exactly the seven the menu has, so a missing label is a type error rather
 *  than a blank row. */
export type AccountNavLabels = {
  profile: string;
  orders: string;
  addresses: string;
  payment: string;
  vouchers: string;
  referrals: string;
  settings: string;
};

export function accountNav(
  locale: Locale,
  labels: AccountNavLabels,
): readonly AccountNavItem[] {
  const at = (path: string) => withLocale(path, locale);
  return [
    { id: "account", label: labels.profile, href: at(ROUTES.account.path) },
    { id: "orders", label: labels.orders, href: at(ROUTES.orders.path) },
    { id: "addresses", label: labels.addresses, href: at(ROUTES.addresses.path) },
    { id: "payment", label: labels.payment, href: at(ROUTES.paymentMethods.path) },
    { id: "vouchers", label: labels.vouchers, href: at(ROUTES.vouchers.path) },
    { id: "referrals", label: labels.referrals, href: at(ROUTES.referrals.path) },
    { id: "settings", label: labels.settings, href: at(ROUTES.settings.path) },
  ];
}
