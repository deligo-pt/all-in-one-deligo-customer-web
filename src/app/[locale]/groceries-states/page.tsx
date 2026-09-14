import { notFound } from "next/navigation";
import { GroceryListing, StoreView } from "@/features/groceries";
import { TranslationProvider } from "@/i18n/TranslationProvider";
import { getLocale } from "@/i18n/server";
import { loadNamespace } from "@/i18n/namespaces";
import { withLocale } from "@/lib/i18n/path";
import { ROUTES } from "@/lib/routes";
import { listingCopy, storeCopy } from "./copy";
import {
  ADDRESS_FIXTURE,
  CART_FIXTURE,
  LISTING_FIXTURE,
  STORE_FIXTURE,
} from "./fixture";

/**
 * The grocery screens, populated. **Development only; 404s in production.**
 *
 * The listing with its shelves and banner, the same listing unavailable, and a
 * store with its part of the cart. The grocery order tracker is on
 * `/orders-states`, beside the food one.
 */
export default async function GroceriesStatesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const locale = await getLocale();
  const [groceries, food, cart, common] = await Promise.all([
    loadNamespace(locale, "groceries"),
    loadNamespace(locale, "food"),
    loadNamespace(locale, "cart"),
    loadNamespace(locale, "common"),
  ]);
  const lookup = (messages: Record<string, string>) => (k: string) => messages[k] ?? k;
  const [t, f, c] = [lookup(groceries), lookup(food), lookup(cart)];

  return (
    <TranslationProvider locale={locale} messages={{ common, groceries, food, cart }}>
      <div className="flex flex-col gap-16 py-8">
        <GroceryListing
          locale={locale}
          listing={LISTING_FIXTURE}
          address={ADDRESS_FIXTURE}
          changeHref={withLocale(ROUTES.groceries.path, locale)}
          copy={listingCopy(t, f)}
        />
        <GroceryListing
          locale={locale}
          listing={{ shelves: [] }}
          address={ADDRESS_FIXTURE}
          changeHref={withLocale(ROUTES.groceries.path, locale)}
          copy={listingCopy(t, f)}
          unavailable
        />
        <StoreView
          store={STORE_FIXTURE}
          cart={CART_FIXTURE}
          checkoutHref={withLocale(ROUTES.checkout.path, locale)}
          loginHref={withLocale(ROUTES.login.path, locale)}
          copy={storeCopy(t, f, c)}
          offlineNotice={f("offlineAdd")}
        />
      </div>
    </TranslationProvider>
  );
}
